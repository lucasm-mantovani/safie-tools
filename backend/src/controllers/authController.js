import { supabaseAdmin } from '../config/supabase.js'
import { hubspotService } from '../services/hubspotService.js'

// Dispara criação no HubSpot sem bloquear a resposta ao frontend
// Usa wrapper async para poder usar await internamente sem violar a convenção
function syncHubspotAsync(userId, contactData) {
  ;(async () => {
    try {
      const hubspotId = await hubspotService.createContact(contactData)
      if (hubspotId) {
        await supabaseAdmin
          .from('profiles')
          .update({ hubspot_contact_id: hubspotId })
          .eq('id', userId)
      }
    } catch (err) {
      console.error('[HubSpot] Falha ao criar contato para user', userId, ':', err.message)
    }
  })()
}

export async function register(req, res, next) {
  try {
    const { user_id, full_name, email, phone, company_name, business_segment } = req.body

    // FIX 2: Garante que o user_id do body corresponde ao usuário autenticado
    // Impede que um usuário crie perfis para outros user_ids
    if (user_id !== req.user.id) {
      return res.status(403).json({ message: 'Não autorizado: user_id não pertence ao usuário autenticado' })
    }

    // Idempotência: se perfil já existe, retorna sem erro (ex: chamada duplicada ou retry)
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (existing) {
      return res.status(200).json({ profile: existing, created: false })
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .insert({ id: user_id, full_name, email, phone, company_name, business_segment })
      .select()
      .single()

    if (error) throw error

    // Dispara HubSpot de forma assíncrona sem bloquear a resposta
    syncHubspotAsync(user_id, { full_name, email, phone, company_name, business_segment })

    res.status(201).json({ profile, created: true })
  } catch (err) {
    next(err)
  }
}

export async function checkProfile(req, res, next) {
  try {
    // Endpoint usado pelo frontend para detectar novos usuários OAuth
    // Retorna { exists: false } sem erro 404 — nunca quebra o fluxo do frontend
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, company_name')
      .eq('id', req.user.id)
      .single()

    if (!data) {
      return res.json({ exists: false })
    }

    res.json({ exists: true, profile: data })
  } catch (err) {
    // single() lança erro se não encontrar — tratamos como "não existe"
    res.json({ exists: false })
  }
}

export async function getProfile(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) throw error
    res.json({ profile: data })
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { full_name, phone, company_name, business_segment } = req.body

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name, phone, company_name, business_segment })
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) throw error

    // Atualiza dados no HubSpot se o contato já estiver vinculado
    if (profile.hubspot_contact_id) {
      ;(async () => {
        try {
          await hubspotService.updateContact(profile.hubspot_contact_id, {
            firstname: full_name?.split(' ')[0] || '',
            lastname: full_name?.split(' ').slice(1).join(' ') || '',
            phone: phone || '',
            company: company_name || '',
          })
        } catch (err) {
          console.error('[HubSpot] Falha ao atualizar contato:', err.message)
        }
      })()
    }

    res.json({ profile })
  } catch (err) {
    next(err)
  }
}
