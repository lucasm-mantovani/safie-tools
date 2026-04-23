import { randomUUID } from 'crypto'
import { supabaseAdmin } from '../config/supabase.js'
import { supabaseService } from '../services/supabaseService.js'
import { calculate } from '../services/equityCalculatorService.js'
import { generateNarrative } from '../services/narrativeService.js'
import { generateAlerts } from '../services/alertService.js'
import { runFullCalculation } from '../services/taxCalculatorService.js'
import { generateLevers } from '../services/taxLeverService.js'
import { calculateHealthScore } from '../services/healthScoreService.js'

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
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ session: data })
  } catch (err) {
    next(err)
  }
}

export async function createEquitySession(req, res, next) {
  try {
    const { business_briefing, partners, dimension_weights, evaluations, qualification_data: extraQual } = req.body
    const sortedEvals = [...evaluations].sort((a, b) => a.partner_index - b.partner_index)
    const calculated = calculate(partners, sortedEvals, dimension_weights)
    const narrative = generateNarrative(calculated, dimension_weights)
    const alerts = generateAlerts(calculated, sortedEvals)

    const hasAgreement = business_briefing.has_shareholders_agreement
    const qualification_data = {
      equity_company_status: business_briefing.company_status || business_briefing.company_stage || '',
      equity_has_shareholders_agreement: hasAgreement,
      equity_business_segment: business_briefing.business_segment,
      equity_partners_count: String(partners.length),
      equity_sql_tag: hasAgreement === 'nao' || hasAgreement === 'rascunho_sem_advogado',
      ...extraQual,
    }

    const session = await supabaseService.createToolSession({
      userId: req.user.id,
      toolSlug: 'equity-calculator',
      inputData: { business_briefing, partners, dimension_weights, evaluations },
      outputData: { partners: calculated, narrative, alerts },
      qualificationData: qualification_data,
    })

    res.status(201).json({
      result: { partners: calculated },
      narrative,
      alerts,
      qualification_data,
      session_id: session.id,
    })
  } catch (err) {
    next(err)
  }
}

// ── Tax Better — lógica de recomendação ──────────────────────────────────────

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

  if (tier === 6) return 'lucro_real'
  if (tier === 1) return 'mei'

  if (tier === 5) {
    if (profit_margin === 'ate_10') return 'lucro_real'
    return 'lucro_presumido'
  }

  if (activity_type === 'servicos') {
    if (profit_margin === 'acima_30' && tier >= 4) return 'lucro_presumido'
    if (profit_margin === 'ate_10' && tier >= 3) return 'lucro_real'
  }

  return 'simples'
}

function getTaxDiagnosis(input) {
  const { annual_revenue_range, current_regime, activity_type, profit_margin, last_reviewed } = input
  const recommended = getRecommendedRegime(annual_revenue_range, activity_type, profit_margin)
  const tier = REVENUE_TIER[annual_revenue_range]

  const invalidCombos = [
    { regime: 'mei', minTier: 2 },
    { regime: 'simples', minTier: 6 },
    { regime: 'lucro_presumido', minTier: 6 },
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
    status,
    recommended_regime: recommended,
    recommended_regime_label: regime_labels[recommended],
    current_regime_label: regime_labels[current_regime] || current_regime,
    savings_estimate_pct: savings_pct,
    reasoning,
    cta,
  }
}

export async function calculateTaxBetter(req, res, next) {
  try {
    const { annual_revenue_range, current_regime, last_reviewed } = req.body

    const diagnosis = getTaxDiagnosis(req.body)

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

    res.status(201).json({
      result: diagnosis,
      qualification_data,
      session_id: session.id,
    })
  } catch (err) {
    next(err)
  }
}

// ── Labor Risk ────────────────────────────────────────────────────────────────

const RISK_FACTORS = ['exclusivity', 'subordination', 'regularity', 'time_control', 'equipment_provided']

function getContractorRisk(contractor) {
  const score = RISK_FACTORS.filter((f) => contractor[f] === true).length
  const level = score <= 1 ? 'baixo' : score <= 3 ? 'medio' : 'alto'
  return { score, level }
}

const RISK_RECOMMENDATIONS = {
  alto: 'Revise o contrato imediatamente. Os indicadores apontam vínculo empregatício. Risco real de reclamação trabalhista.',
  medio: 'Contrato apresenta pontos de atenção. Recomenda-se revisão preventiva das cláusulas e da relação de trabalho.',
  baixo: 'Relação PJ bem estruturada. Mantenha o monitoramento periódico das condições do contrato.',
}

export async function calculateLaborRisk(req, res, next) {
  try {
    const { contractors, has_had_lawsuit } = req.body

    const evaluated = contractors.map((c) => {
      const { score, level } = getContractorRisk(c)
      return {
        name: c.name,
        score,
        risk_level: level,
        factors: {
          exclusivity: c.exclusivity,
          subordination: c.subordination,
          regularity: c.regularity,
          time_control: c.time_control,
          equipment_provided: c.equipment_provided,
        },
        recommendation: RISK_RECOMMENDATIONS[level],
      }
    })

    const high_risk_count = evaluated.filter((c) => c.risk_level === 'alto').length
    const medium_risk_count = evaluated.filter((c) => c.risk_level === 'medio').length

    let overall_exposure
    if (high_risk_count >= 2 || (high_risk_count >= 1 && has_had_lawsuit)) {
      overall_exposure = 'alto'
    } else if (high_risk_count === 1 || medium_risk_count >= 2) {
      overall_exposure = 'medio'
    } else {
      overall_exposure = 'baixo'
    }

    const pj_sql_tag = high_risk_count >= 2

    const qualification_data = {
      pj_contractors_count: String(contractors.length),
      pj_high_risk_count: String(high_risk_count),
      pj_has_had_lawsuit: has_had_lawsuit,
      pj_sql_tag,
    }

    const result = {
      contractors: evaluated,
      high_risk_count,
      medium_risk_count,
      overall_exposure,
      total: contractors.length,
    }

    const session = await supabaseService.createToolSession({
      userId: req.user.id,
      toolSlug: 'labor-risk',
      inputData: req.body,
      outputData: result,
      qualificationData: qualification_data,
    })

    res.status(201).json({ result, qualification_data, session_id: session.id })
  } catch (err) {
    next(err)
  }
}

// ── Fast Due Diligence ────────────────────────────────────────────────────────

const CHECKLIST_LIBRARY = [
  { id: 's1', area: 'societario', title: 'Contrato ou Estatuto Social atualizado', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 's2', area: 'societario', title: 'Acordo de Sócios vigente', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 's3', area: 'societario', title: 'Cap table atualizado', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 's4', area: 'societario', title: 'Atas de reuniões dos últimos 2 anos', priority: 'media', ops: ['ma','venda_participacao'] },
  { id: 's5', area: 'societario', title: 'Certidão de regularidade na Junta Comercial', priority: 'alta', ops: ['ma','venda_participacao'] },
  { id: 's6', area: 'societario', title: 'Registro de transferências de quotas', priority: 'media', ops: ['ma','venda_participacao'] },
  { id: 'f1', area: 'fiscal', title: 'Certidões negativas federais (CND/PGFN)', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 'f2', area: 'fiscal', title: 'Certidões negativas estaduais e municipais', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 'f3', area: 'fiscal', title: 'Declarações fiscais dos últimos 3 anos', priority: 'media', ops: ['ma','venda_participacao'] },
  { id: 'f4', area: 'fiscal', title: 'Parcelamentos tributários em aberto', priority: 'alta', ops: ['ma','venda_participacao'] },
  { id: 'f5', area: 'fiscal', title: 'Enquadramento e regime tributário atual', priority: 'media', ops: ['captacao','ma','venda_participacao'] },
  { id: 't1', area: 'trabalhista', title: 'Contratos de trabalho e aditivos vigentes', priority: 'alta', ops: ['ma','venda_participacao'] },
  { id: 't2', area: 'trabalhista', title: 'Processos trabalhistas em andamento', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 't3', area: 'trabalhista', title: 'Contratos com prestadores PJ', priority: 'media', ops: ['captacao','ma','venda_participacao'] },
  { id: 't4', area: 'trabalhista', title: 'FGTS — extrato e comprovantes de recolhimento', priority: 'media', ops: ['ma','venda_participacao'] },
  { id: 't5', area: 'trabalhista', title: 'Folha de pagamento e encargos dos últimos 12 meses', priority: 'media', ops: ['ma','venda_participacao'] },
  { id: 'pi1', area: 'propriedade_intelectual', title: 'Registro de marca no INPI', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 'pi2', area: 'propriedade_intelectual', title: 'Contratos de cessão de PI com colaboradores', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 'pi3', area: 'propriedade_intelectual', title: 'Registro de software (INPI)', priority: 'media', ops: ['captacao','ma'] },
  { id: 'pi4', area: 'propriedade_intelectual', title: 'Domínios e ativos digitais registrados', priority: 'media', ops: ['captacao','ma'] },
  { id: 'c1', area: 'compliance', title: 'Política de privacidade e LGPD', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 'c2', area: 'compliance', title: 'Licenças e alvarás de funcionamento', priority: 'alta', ops: ['ma','venda_participacao'] },
  { id: 'c3', area: 'compliance', title: 'DPO designado (se obrigatório)', priority: 'media', ops: ['ma','venda_participacao'] },
  { id: 'ct1', area: 'contratos', title: 'Contratos com clientes principais', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 'ct2', area: 'contratos', title: 'Contratos com fornecedores-chave', priority: 'media', ops: ['ma','venda_participacao'] },
  { id: 'ct3', area: 'contratos', title: 'NDAs assinados com terceiros', priority: 'media', ops: ['captacao','ma'] },
  { id: 'ct4', area: 'contratos', title: 'Termos de uso e SLA com clientes', priority: 'media', ops: ['captacao','ma'] },
  { id: 'fin1', area: 'financeiro', title: 'Balanço patrimonial dos últimos 2 anos', priority: 'alta', ops: ['ma','venda_participacao'] },
  { id: 'fin2', area: 'financeiro', title: 'DRE (Demonstração de Resultado)', priority: 'alta', ops: ['captacao','ma','venda_participacao'] },
  { id: 'fin3', area: 'financeiro', title: 'Fluxo de caixa projetado', priority: 'alta', ops: ['captacao','ma'] },
  { id: 'fin4', area: 'financeiro', title: 'Dívidas e passivos contingentes', priority: 'alta', ops: ['ma','venda_participacao'] },
  { id: 'fin5', area: 'financeiro', title: 'Extratos bancários dos últimos 12 meses', priority: 'media', ops: ['ma','venda_participacao'] },
]

const AREA_LABELS = {
  societario: 'Societário', fiscal: 'Fiscal', trabalhista: 'Trabalhista',
  propriedade_intelectual: 'Propriedade Intelectual', compliance: 'Compliance',
  contratos: 'Contratos', financeiro: 'Financeiro',
}

const AREA_WEEKS = { micro: 1, pequena: 2, media: 3, grande: 4 }

export async function calculateFastDueDiligence(req, res, next) {
  try {
    const { operation_type, timeline_months, has_legal_advisor, company_size, has_shareholders_agreement } = req.body

    const filtered = CHECKLIST_LIBRARY.filter((item) => item.ops.includes(operation_type))

    const areaMap = {}
    filtered.forEach((item) => {
      if (!areaMap[item.area]) areaMap[item.area] = []
      areaMap[item.area].push({ id: item.id, title: item.title, priority: item.priority })
    })

    const weeks_per_area = AREA_WEEKS[company_size] || 2
    const areas = Object.entries(areaMap).map(([area, items]) => ({
      area,
      label: AREA_LABELS[area],
      items,
      estimated_weeks: weeks_per_area,
      high_priority_count: items.filter((i) => i.priority === 'alta').length,
    }))

    const total_items = filtered.length
    const high_priority = filtered.filter((i) => i.priority === 'alta').length
    const tight_timeline = ['ate_3', '3_a_6'].includes(timeline_months)

    const dd_sql_tag = tight_timeline && !has_legal_advisor

    const qualification_data = {
      dd_operation_type: operation_type,
      dd_timeline_months: timeline_months,
      dd_has_legal_advisor: has_legal_advisor,
      dd_sql_tag,
    }

    const result = {
      areas,
      total_items,
      high_priority,
      tight_timeline,
      has_legal_advisor,
      has_shareholders_agreement,
      operation_type,
    }

    const session = await supabaseService.createToolSession({
      userId: req.user.id,
      toolSlug: 'fast-due-diligence',
      inputData: req.body,
      outputData: result,
      qualificationData: qualification_data,
    })

    res.status(201).json({ result, qualification_data, session_id: session.id })
  } catch (err) { next(err) }
}

// ── Litigation Cost ───────────────────────────────────────────────────────────

const DISPUTE_MID = {
  ate_10k: 5000, '10k_50k': 30000, '50k_200k': 125000,
  '200k_1M': 600000, acima_1M: 1500000,
}

function calcLitigationCosts(input) {
  const { conflict_type, dispute_value_range, has_lawyer, instance, estimated_duration, success_probability } = input
  const value = DISPUTE_MID[dispute_value_range]

  const court_fee_rate = {
    trabalhista: { primeira: 0.02, segunda: 0.04, superior: 0.05 },
    civel:       { primeira: 0.015, segunda: 0.03, superior: 0.04 },
    societario:  { primeira: 0.015, segunda: 0.03, superior: 0.04 },
    fiscal:      { primeira: 0.01, segunda: 0.02, superior: 0.03 },
  }
  const court_fees = Math.min(value * (court_fee_rate[conflict_type]?.[instance] || 0.02), 50000)

  const lawyer_rate = conflict_type === 'trabalhista' ? 0.25 : 0.15
  const lawyer_fees = has_lawyer ? 0 : value * lawyer_rate

  const loss_risk = value * (1 - success_probability / 100)

  const duration_months = { ate_1_ano: 10, '1_a_3_anos': 24, acima_3_anos: 48 }
  const months = duration_months[estimated_duration] || 24
  const opportunity_cost = value * 0.01 * months

  const total = court_fees + lawyer_fees + loss_risk + opportunity_cost

  const settlement_min = Math.round(value * 0.5)
  const settlement_max = Math.round(value * 0.75)

  const recommend_settlement = total > value * 0.5

  return {
    dispute_value_estimated: value,
    court_fees: Math.round(court_fees),
    lawyer_fees: Math.round(lawyer_fees),
    loss_risk: Math.round(loss_risk),
    opportunity_cost: Math.round(opportunity_cost),
    total_litigation_cost: Math.round(total),
    settlement_range: { min: settlement_min, max: settlement_max },
    recommend_settlement,
    cost_vs_value_pct: Math.round((total / value) * 100),
  }
}

export async function calculateLitigationCost(req, res, next) {
  try {
    const { conflict_type, dispute_value_range, has_lawyer } = req.body

    const costs = calcLitigationCosts(req.body)

    const high_value = ['50k_200k', '200k_1M', 'acima_1M'].includes(dispute_value_range)
    const litigation_sql_tag = high_value && !has_lawyer

    const qualification_data = {
      litigation_conflict_type: conflict_type,
      litigation_dispute_value: dispute_value_range,
      litigation_has_lawyer: has_lawyer,
      litigation_sql_tag,
    }

    const session = await supabaseService.createToolSession({
      userId: req.user.id,
      toolSlug: 'litigation-cost',
      inputData: req.body,
      outputData: costs,
      qualificationData: qualification_data,
    })

    res.status(201).json({ result: costs, qualification_data, session_id: session.id })
  } catch (err) { next(err) }
}

// ── Partners Cash ─────────────────────────────────────────────────────────────

// Portaria MPS nº 1.716/2024 - vigência jan/2025
function calcINSS(prolabore) {
  const teto = 8157.41
  const base = Math.min(prolabore, teto)
  if (base <= 1518.00) return base * 0.075
  if (base <= 2793.88) return 1518.00 * 0.075 + (base - 1518.00) * 0.09
  if (base <= 4190.83) return 1518.00 * 0.075 + (2793.88 - 1518.00) * 0.09 + (base - 2793.88) * 0.12
  return 1518.00 * 0.075 + (2793.88 - 1518.00) * 0.09 + (4190.83 - 2793.88) * 0.12 + (base - 4190.83) * 0.14
}

function calcIR(base) {
  if (base <= 2259.20) return 0
  if (base <= 2826.65) return (base - 2259.20) * 0.075
  if (base <= 3751.05) return (2826.65 - 2259.20) * 0.075 + (base - 2826.65) * 0.15
  if (base <= 4664.68) return (2826.65 - 2259.20) * 0.075 + (3751.05 - 2826.65) * 0.15 + (base - 3751.05) * 0.225
  return (2826.65 - 2259.20) * 0.075 + (3751.05 - 2826.65) * 0.15 + (4664.68 - 3751.05) * 0.225 + (base - 4664.68) * 0.275
}

const REVENUE_MID_MONTHLY = {
  ate_10k: 7000, '10k_30k': 20000, '30k_80k': 55000,
  '80k_200k': 140000, acima_200k: 300000,
}

const PROLABORE_MID = {
  salario_minimo: 1412, ate_5k: 3500, '5k_a_10k': 7500,
  '10k_a_20k': 15000, acima_20k: 25000,
}

function calcPartnersCash(input) {
  const { monthly_revenue_range, tax_regime, current_prolabore_range, partners_receiving } = input

  const revenue = REVENUE_MID_MONTHLY[monthly_revenue_range]
  const current_prolabore = PROLABORE_MID[current_prolabore_range]

  const inss_current = calcINSS(current_prolabore)
  const ir_current = calcIR(current_prolabore - inss_current)
  const net_current = current_prolabore - inss_current - ir_current

  const min_prolabore = 1412
  const inss_optimized = calcINSS(min_prolabore)
  const ir_optimized = calcIR(min_prolabore - inss_optimized)
  const net_prolabore_optimized = min_prolabore - inss_optimized - ir_optimized

  const available_for_distribution = revenue * 0.2
  const dividends_per_partner = available_for_distribution / partners_receiving
  const dividends_tax = tax_regime === 'lucro_real' ? dividends_per_partner * 0 : 0

  const net_optimized = net_prolabore_optimized + dividends_per_partner - dividends_tax

  const monthly_savings = Math.max(0, net_optimized - net_current)
  const annual_savings = monthly_savings * 12

  return {
    current: {
      prolabore: current_prolabore,
      inss: Math.round(inss_current),
      ir: Math.round(ir_current),
      net_income: Math.round(net_current),
    },
    optimized: {
      prolabore: min_prolabore,
      inss: Math.round(inss_optimized),
      ir: Math.round(ir_optimized),
      dividends: Math.round(dividends_per_partner),
      net_income: Math.round(net_optimized),
    },
    monthly_savings: Math.round(monthly_savings),
    annual_savings: Math.round(annual_savings),
    tax_regime,
    dividends_taxable: tax_regime === 'lucro_real',
  }
}

export async function calculatePartnersCash(req, res, next) {
  try {
    const { monthly_revenue_range, tax_regime, has_accountant } = req.body

    const analysis = calcPartnersCash(req.body)

    const prolabore_sql_tag = !has_accountant

    const qualification_data = {
      prolabore_monthly_revenue: monthly_revenue_range,
      prolabore_current_regime: tax_regime,
      prolabore_has_accountant: has_accountant,
      prolabore_sql_tag,
    }

    const session = await supabaseService.createToolSession({
      userId: req.user.id,
      toolSlug: 'partners-cash',
      inputData: req.body,
      outputData: analysis,
      qualificationData: qualification_data,
    })

    res.status(201).json({ result: analysis, qualification_data, session_id: session.id })
  } catch (err) { next(err) }
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

export async function getEquitySession(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tool_sessions')
      .select('*')
      .eq('id', req.params.id)
      .eq('tool_slug', 'equity-calculator')
      .single()
    if (error) throw error
    if (data.user_id !== req.user.id) return res.status(403).json({ message: 'Acesso negado' })
    res.json({ session: data })
  } catch (err) {
    next(err)
  }
}

export async function getEquitySessionsByUser(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tool_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('tool_slug', 'equity-calculator')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ sessions: data })
  } catch (err) {
    next(err)
  }
}

export async function createEquityInvite(req, res, next) {
  try {
    const { session_id, invitee_email, invitee_name, partner_index } = req.body
    const token = randomUUID()
    const { data, error } = await supabaseAdmin
      .from('equity_invites')
      .insert({ session_id, invitee_email, invitee_name, partner_index, token })
      .select().single()
    if (error) throw error
    console.log(`[Invite] Convite para ${invitee_email}: token=${token}`)
    res.status(201).json({ invite: data })
  } catch (err) {
    next(err)
  }
}

export async function createEquityShare(req, res, next) {
  try {
    const { session_id } = req.body
    const public_token = randomUUID()
    const { data, error } = await supabaseAdmin
      .from('equity_shared_results')
      .insert({ session_id, public_token })
      .select().single()
    if (error) throw error
    res.status(201).json({ token: public_token })
  } catch (err) {
    next(err)
  }
}

export async function getEquityBenchmark(req, res) {
  res.json({ available: false, message: 'Dados de benchmark insuficientes ainda.' })
}

// ── Tax Diagnostic ────────────────────────────────────────────────────────────

function buildCalcData(body) {
  const { company_profile, revenue_data, cost_structure = {}, supplementary_data = {} } = body
  return {
    monthly_revenue: revenue_data.monthly_revenue,
    activity_type: company_profile.activity_type,
    current_regime: company_profile.current_regime === 'nao_sei' ? 'lucro_presumido' : company_profile.current_regime,
    services_revenue_pct: revenue_data.services_revenue_pct ?? 100,
    payroll: cost_structure.payroll ?? 0,
    documented_supplier_costs: cost_structure.documented_supplier_costs ?? 0,
    rent: cost_structure.rent ?? 0,
    other_documented_costs: cost_structure.other_documented_costs ?? 0,
    iss_rate: supplementary_data.iss_rate ?? 0.05,
  }
}

export async function createTaxDiagnosticSession(req, res, next) {
  try {
    const calcData = buildCalcData(req.body)
    const results = runFullCalculation(calcData)
    const levers = generateLevers(req.body, results)
    const health_score = calculateHealthScore(req.body, results)

    const qualification_data = {
      tax_annual_revenue_range: String(req.body.revenue_data.monthly_revenue * 12),
      tax_current_regime: req.body.company_profile.current_regime,
      tax_last_reviewed: req.body.qualification_data?.last_regime_review || req.body.supplementary_data?.last_regime_review || '',
      tax_has_accountant: req.body.qualification_data?.has_accountant || req.body.supplementary_data?.has_accountant || '',
      tax_recommended_regime: results.recommended_regime,
      tax_annual_savings_potential: String(Math.round(results.annual_savings_potential)),
      tax_sql_tag: results.annual_savings_potential > 12000
        || req.body.qualification_data?.has_accountant === 'nao'
        || req.body.qualification_data?.has_accountant === 'insatisfeito',
      ...req.body.qualification_data,
    }

    const session = await supabaseService.createToolSession({
      userId: req.user.id,
      toolSlug: 'tax-regime-diagnostic',
      inputData: req.body,
      outputData: { results, levers, health_score },
      qualificationData: qualification_data,
    })

    res.status(201).json({ result: { results, levers, health_score }, qualification_data, session_id: session.id })
  } catch (err) {
    next(err)
  }
}

export async function getTaxDiagnosticSession(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tool_sessions').select('*')
      .eq('id', req.params.id).eq('tool_slug', 'tax-regime-diagnostic').single()
    if (error) throw error
    if (data.user_id !== req.user.id) return res.status(403).json({ message: 'Acesso negado' })
    res.json({ session: data })
  } catch (err) {
    next(err)
  }
}

export async function getTaxDiagnosticSessionsByUser(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tool_sessions').select('*')
      .eq('user_id', req.user.id).eq('tool_slug', 'tax-regime-diagnostic')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ sessions: data })
  } catch (err) {
    next(err)
  }
}

export async function getTaxDiagnosticBenchmark(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tool_sessions')
      .select('output_data, qualification_data')
      .eq('tool_slug', 'tax-regime-diagnostic')
      .limit(100)
    if (error) throw error
    if (!data || data.length < 5) return res.json({ available: false, message: 'Dados de benchmark insuficientes ainda.' })
    const regimes = data.map(s => s.output_data?.results?.recommended_regime).filter(Boolean)
    const freq = regimes.reduce((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc }, {})
    res.json({ available: true, sample_size: data.length, recommended_regime_distribution: freq })
  } catch (err) {
    next(err)
  }
}
