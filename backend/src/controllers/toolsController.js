import { supabaseAdmin } from '../config/supabase.js'
import { supabaseService } from '../services/supabaseService.js'
import { hubspotService } from '../services/hubspotService.js'

export async function listTools(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tools')
      .select('*')
      .eq('is_active', true)
      .order('order_index')

    if (error) throw error
    res.json({ tools: data })
  } catch (err) {
    next(err)
  }
}

export async function saveSession(req, res, next) {
  try {
    const { tool_slug, input_data, output_data, qualification_data } = req.body

    const { data, error } = await supabaseAdmin
      .from('tool_sessions')
      .insert({
        user_id: req.user.id,
        tool_slug,
        input_data,
        output_data,
        qualification_data,
        hubspot_synced: false,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ session: data })
  } catch (err) {
    next(err)
  }
}

export async function calculateEquity(req, res, next) {
  try {
    const { partners, company_status, has_shareholders_agreement, business_segment } = req.body

    // Soma total de todos os pontos de todos os sócios em todos os critérios
    const totalScore = partners.reduce((sum, p) => {
      return sum + p.financial + p.dedication + p.technical + p.commercial + p.network
    }, 0)

    // Calcula percentual proporcional de cada sócio
    const result = partners.map((p) => {
      const partnerScore = p.financial + p.dedication + p.technical + p.commercial + p.network
      const percentage = totalScore > 0 ? (partnerScore / totalScore) * 100 : 100 / partners.length
      return {
        name: p.name,
        percentage: Math.round(percentage * 100) / 100,
      }
    })

    const qualification_data = {
      equity_company_status: company_status,
      equity_has_shareholders_agreement: has_shareholders_agreement,
      equity_business_segment: business_segment,
      equity_partners_count: String(partners.length),
      equity_sql_tag: has_shareholders_agreement === 'nao',
    }

    // Persiste sessão no Supabase
    const session = await supabaseService.createToolSession({
      userId: req.user.id,
      toolSlug: 'equity-calculator',
      inputData: req.body,
      outputData: { partners: result },
      qualificationData: qualification_data,
    })

    // Sincroniza com HubSpot de forma assíncrona (não bloqueia resposta)
    ;(async () => {
      try {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('hubspot_contact_id')
          .eq('id', req.user.id)
          .single()

        if (!profile?.hubspot_contact_id) return

        const { count: sessionCount } = await supabaseAdmin
          .from('tool_sessions')
          .select('id', { count: 'exact' })
          .eq('user_id', req.user.id)

        await hubspotService.updateContact(profile.hubspot_contact_id, {
          safie_tools_last_tool_used: 'equity-calculator',
          safie_tools_sessions_count: String(sessionCount || 0),
          equity_company_status: qualification_data.equity_company_status,
          equity_has_shareholders_agreement: qualification_data.equity_has_shareholders_agreement,
          equity_business_segment: qualification_data.equity_business_segment,
          equity_partners_count: qualification_data.equity_partners_count,
          equity_sql_tag: String(qualification_data.equity_sql_tag),
        })

        await supabaseAdmin
          .from('tool_sessions')
          .update({ hubspot_synced: true })
          .eq('id', session.id)
      } catch (err) {
        console.error('[HubSpot] Sync equity-calculator falhou:', err.message)
      }
    })()

    res.status(201).json({
      result: { partners: result },
      qualification_data,
      session_id: session.id,
    })
  } catch (err) {
    next(err)
  }
}

// ── Tax Better — lógica de recomendação ──────────────────────────────────────

// Faixas de receita ordenadas para determinar elegibilidade de regime
const REVENUE_TIER = {
  ate_81k:    1,
  '81k_360k': 2,
  '360k_1M':  3,
  '1M_4_8M':  4,
  '4_8M_78M': 5,
  acima_78M:  6,
}

function getRecommendedRegime(revenue_range, activity_type, profit_margin) {
  const tier = REVENUE_TIER[revenue_range]

  // Lucro Real obrigatório acima de R$78M
  if (tier === 6) return 'lucro_real'

  // Faixa MEI (até R$81k)
  if (tier === 1) return 'mei'

  // Faixa Lucro Presumido/Real obrigatória (R$4,8M–R$78M)
  if (tier === 5) {
    // Margem muito baixa → LR costuma ser melhor (base real < presumida)
    if (profit_margin === 'ate_10') return 'lucro_real'
    return 'lucro_presumido'
  }

  // Faixas do Simples Nacional (R$81k–R$4,8M)
  if (activity_type === 'servicos') {
    // Alta margem em serviços na faixa superior do Simples: LP pode ser vantajoso
    if (profit_margin === 'acima_30' && tier >= 4) return 'lucro_presumido'
    // Margem muito baixa em serviços: Lucro Real pode ser melhor que LP
    if (profit_margin === 'ate_10' && tier >= 3) return 'lucro_real'
  }

  return 'simples'
}

function getTaxDiagnosis(input) {
  const { annual_revenue_range, current_regime, activity_type, profit_margin, last_reviewed } = input
  const recommended = getRecommendedRegime(annual_revenue_range, activity_type, profit_margin)
  const tier = REVENUE_TIER[annual_revenue_range]

  // Regime atual inviável para a faixa de faturamento
  const invalidCombos = [
    { regime: 'mei', minTier: 2 },           // MEI acima de R$81k
    { regime: 'simples', minTier: 6 },       // Simples acima de R$78M
    { regime: 'lucro_presumido', minTier: 6 }, // LP acima de R$78M
  ]
  const isInvalid = invalidCombos.some(
    (c) => current_regime === c.regime && tier >= c.minTier
  )

  let status, savings_pct, reasoning, cta

  if (isInvalid) {
    status = 'revisao_urgente'
    savings_pct = 30
    reasoning = `O regime ${current_regime.toUpperCase()} não é permitido para o seu faturamento. Regularização é urgente.`
    cta = 'Seu enquadramento atual pode estar em desacordo com a legislação. A SAFIE pode regularizar sua situação.'
  } else if (current_regime === recommended || current_regime === 'nao_sei') {
    const reviewedRecently = last_reviewed === 'menos_1_ano'
    status = reviewedRecently ? 'otimizado' : 'atencao'
    savings_pct = reviewedRecently ? 0 : 8
    reasoning = reviewedRecently
      ? `Seu regime atual (${recommended}) parece adequado e foi revisado recentemente.`
      : `Seu regime aparenta estar correto, mas sem revisão recente não é possível confirmar a otimização.`
    cta = reviewedRecently
      ? 'Continue fazendo revisões anuais para garantir que permanece no regime ideal.'
      : 'Uma revisão tributária pode confirmar (ou melhorar) seu enquadramento atual.'
  } else {
    // Regime diferente do recomendado
    const marginRisk = profit_margin === 'ate_10' || profit_margin === 'abaixo_10'
    status = marginRisk ? 'revisao_urgente' : 'atencao'
    savings_pct = marginRisk ? 25 : 15
    reasoning = `Com seu faturamento, atividade e margem de lucro, o regime ${recommended} tende a ser mais vantajoso que o ${current_regime}.`
    cta = `Uma simulação detalhada com a SAFIE pode quantificar exatamente quanto você economizaria migrando para o ${recommended}.`
  }

  const regime_labels = {
    mei: 'MEI',
    simples: 'Simples Nacional',
    lucro_presumido: 'Lucro Presumido',
    lucro_real: 'Lucro Real',
    nao_sei: 'Não identificado',
  }

  return {
    status,                              // 'otimizado' | 'atencao' | 'revisao_urgente'
    recommended_regime: recommended,
    recommended_regime_label: regime_labels[recommended],
    current_regime_label: regime_labels[current_regime] || current_regime,
    savings_estimate_pct: savings_pct,   // % estimado de economia potencial
    reasoning,
    cta,
  }
}

export async function calculateTaxBetter(req, res, next) {
  try {
    const { annual_revenue_range, current_regime, activity_type, profit_margin, last_reviewed } = req.body

    const diagnosis = getTaxDiagnosis(req.body)

    // SQL tag: faturamento > R$500k E revisão há mais de 1 ano ou nunca
    const highRevenueTiers = ['1M_4_8M', '4_8M_78M', 'acima_78M', '360k_1M']
    const staleReview = last_reviewed === 'nunca' || last_reviewed === 'mais_2_anos' || last_reviewed === '1_a_2_anos'
    const tax_sql_tag = highRevenueTiers.includes(annual_revenue_range) && staleReview

    const qualification_data = {
      tax_annual_revenue_range: annual_revenue_range,
      tax_current_regime: current_regime,
      tax_last_reviewed: last_reviewed,
      tax_sql_tag,
    }

    const session = await supabaseService.createToolSession({
      userId: req.user.id,
      toolSlug: 'tax-better',
      inputData: req.body,
      outputData: diagnosis,
      qualificationData: qualification_data,
    })

    ;(async () => {
      try {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('hubspot_contact_id')
          .eq('id', req.user.id)
          .single()

        if (!profile?.hubspot_contact_id) return

        const { count: sessionCount } = await supabaseAdmin
          .from('tool_sessions')
          .select('id', { count: 'exact' })
          .eq('user_id', req.user.id)

        await hubspotService.updateContact(profile.hubspot_contact_id, {
          safie_tools_last_tool_used: 'tax-better',
          safie_tools_sessions_count: String(sessionCount || 0),
          tax_annual_revenue_range: qualification_data.tax_annual_revenue_range,
          tax_current_regime: qualification_data.tax_current_regime,
          tax_last_reviewed: qualification_data.tax_last_reviewed,
          tax_sql_tag: String(qualification_data.tax_sql_tag),
        })

        await supabaseAdmin
          .from('tool_sessions')
          .update({ hubspot_synced: true })
          .eq('id', session.id)
      } catch (err) {
        console.error('[HubSpot] Sync tax-better falhou:', err.message)
      }
    })()

    res.status(201).json({
      result: diagnosis,
      qualification_data,
      session_id: session.id,
    })
  } catch (err) {
    next(err)
  }
}

export async function getSessionsByUser(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tool_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ sessions: data })
  } catch (err) {
    next(err)
  }
}
