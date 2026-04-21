import { hubspotService } from '../services/hubspotService.js'
import { supabaseAdmin } from '../config/supabase.js'

export async function createContact(req, res, next) {
  try {
    const contactId = await hubspotService.createContact(req.body)
    res.status(201).json({ contactId })
  } catch (err) {
    next(err)
  }
}

export async function updateContact(req, res, next) {
  try {
    const { contactId } = req.params
    const { properties } = req.body

    if (!properties || typeof properties !== 'object') {
      return res.status(400).json({ message: 'Campo "properties" é obrigatório e deve ser um objeto' })
    }

    await hubspotService.updateContact(contactId, properties)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

export async function syncToolSession(req, res, next) {
  try {
    const { toolSlug, qualificationData } = req.body

    if (!toolSlug) {
      return res.status(400).json({ message: 'Campo "toolSlug" é obrigatório' })
    }

    // Busca contato HubSpot + contagem de sessões do usuário
    const [profileResult, sessionsResult] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('hubspot_contact_id')
        .eq('id', req.user.id)
        .single(),
      supabaseAdmin
        .from('tool_sessions')
        .select('id', { count: 'exact' })
        .eq('user_id', req.user.id),
    ])

    const profile = profileResult.data
    const sessionCount = sessionsResult.count || 0

    // Se o contato HubSpot ainda não foi vinculado (ex: falha no momento do registro),
    // não retornamos erro — a sincronização simplesmente é ignorada
    if (!profile?.hubspot_contact_id) {
      console.warn('[HubSpot] Sync ignorado — contato não vinculado para user', req.user.id)
      return res.json({ success: true, synced: false })
    }

    // Atualiza propriedades da ferramenta + metadados de uso no HubSpot
    await hubspotService.updateContact(profile.hubspot_contact_id, {
      safie_tools_last_tool_used: toolSlug,
      safie_tools_sessions_count: String(sessionCount),
      ...(qualificationData || {}),
    })

    // Marca sessões não sincronizadas desta ferramenta como sincronizadas
    await supabaseAdmin
      .from('tool_sessions')
      .update({ hubspot_synced: true })
      .eq('user_id', req.user.id)
      .eq('tool_slug', toolSlug)
      .eq('hubspot_synced', false)

    res.json({ success: true, synced: true })
  } catch (err) {
    next(err)
  }
}
