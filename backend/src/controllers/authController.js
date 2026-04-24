import { supabaseAdmin } from '../config/supabase.js'
import { hubspotService } from '../services/hubspotService.js'

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
