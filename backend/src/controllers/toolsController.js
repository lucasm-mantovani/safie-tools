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
