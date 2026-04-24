import { supabaseAdmin } from '../config/supabase.js'
import { hubspotService } from '../services/hubspotService.js'
import { logger } from '../utils/logger.js'
import sharp from 'sharp'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAGIC_BYTES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
}
const MAX_AVATAR_BYTES = 5 * 1024 * 1024

function detectMime(buffer) {
  for (const [mime, magic] of Object.entries(MAGIC_BYTES)) {
    if (magic.every((byte, i) => buffer[i] === byte)) return mime
  }
  return null
}

export async function getProfile(req, res, next) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) throw error

    const { count: sessionsCount } = await supabaseAdmin
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .gt('expires_at', new Date().toISOString())

    res.json({ profile: { ...profile, active_sessions_count: sessionsCount || 0 } })
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { full_name, phone, company_name, business_segment, bio, linkedin_url } = req.body

    if (full_name && (full_name.length < 2 || full_name.length > 100)) {
      return res.status(400).json({ error: 'validation', message: 'Nome deve ter entre 2 e 100 caracteres.' })
    }
    if (bio && bio.length > 500) {
      return res.status(400).json({ error: 'validation', message: 'Bio deve ter no máximo 500 caracteres.' })
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name, phone, company_name, business_segment, bio, linkedin_url })
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) throw error

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
          logger.error('[HubSpot] Falha ao atualizar contato', { message: err.message })
        }
      })()
    }

    res.json({ profile })
  } catch (err) {
    next(err)
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'validation', message: 'Nenhum arquivo enviado.' })
    }

    const buffer = req.file.buffer

    if (buffer.length > MAX_AVATAR_BYTES) {
      return res.status(400).json({ error: 'validation', message: 'Arquivo deve ter no máximo 5MB.' })
    }

    const detectedMime = detectMime(buffer)
    if (!detectedMime || !ALLOWED_MIME.includes(detectedMime)) {
      return res.status(400).json({ error: 'validation', message: 'Apenas imagens JPEG, PNG ou WebP são aceitas.' })
    }

    const resized = await sharp(buffer).resize(400, 400, { fit: 'cover' }).webp({ quality: 85 }).toBuffer()

    const path = `${req.user.id}/avatar.webp`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(path, resized, { contentType: 'image/webp', upsert: true })

    if (uploadError) throw uploadError

    const { data: urlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(path)

    const { error: updateError } = await supabaseAdmin.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', req.user.id)
    if (updateError) throw updateError

    res.json({ avatar_url: urlData.publicUrl })
  } catch (err) {
    next(err)
  }
}

export async function deleteAvatar(req, res, next) {
  try {
    const path = `${req.user.id}/avatar.webp`
    await supabaseAdmin.storage.from('avatars').remove([path])
    await supabaseAdmin.from('profiles').update({ avatar_url: null }).eq('id', req.user.id)
    res.json({ message: 'Avatar removido.' })
  } catch (err) {
    next(err)
  }
}

export async function changeEmail(req, res, next) {
  try {
    const { new_email, current_password } = req.body

    if (!new_email || !current_password) {
      return res.status(400).json({ error: 'validation', message: 'Novo e-mail e senha atual são obrigatórios.' })
    }

    // Verifica senha atual
    const { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: req.user.email,
      password: current_password,
    })
    if (signInError || !authData.session) {
      return res.status(401).json({ error: 'unauthorized', message: 'Senha atual incorreta.' })
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, { email: new_email })
    if (error) throw error

    logger.info('Alteração de e-mail solicitada', { userId: req.user.id, ip: req.ip })
    res.json({ message: 'Confirmação enviada para o novo e-mail. Verifique sua caixa de entrada.' })
  } catch (err) {
    next(err)
  }
}

export async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'validation', message: 'Senha atual e nova senha são obrigatórias.' })
    }
    if (new_password.length < 8 || !/[A-Z]/.test(new_password) || !/[0-9]/.test(new_password) || !/[^A-Za-z0-9]/.test(new_password)) {
      return res.status(400).json({ error: 'validation', message: 'Nova senha deve ter ao menos 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.' })
    }

    // Verifica senha atual
    const { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: req.user.email,
      password: current_password,
    })
    if (signInError || !authData.session) {
      return res.status(401).json({ error: 'unauthorized', message: 'Senha atual incorreta.' })
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, { password: new_password })
    if (error) throw error

    await supabaseAdmin.auth.admin.signOut(req.user.id, 'global')

    res.json({ message: 'Senha alterada. Por segurança, você foi desconectado de todos os outros dispositivos.' })
  } catch (err) {
    next(err)
  }
}

export async function updateNotifications(req, res, next) {
  try {
    const allowed = ['email_product_updates', 'email_tool_results', 'email_commercial']
    const prefs = {}
    for (const key of allowed) {
      if (typeof req.body[key] === 'boolean') prefs[key] = req.body[key]
    }

    if (Object.keys(prefs).length === 0) {
      return res.status(400).json({ error: 'validation', message: 'Nenhuma preferência válida enviada.' })
    }

    const { data: current } = await supabaseAdmin
      .from('profiles')
      .select('notification_preferences')
      .eq('id', req.user.id)
      .single()

    const merged = { ...(current?.notification_preferences || {}), ...prefs }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({ notification_preferences: merged })
      .eq('id', req.user.id)
      .select('notification_preferences')
      .single()

    if (error) throw error
    res.json({ notification_preferences: profile.notification_preferences })
  } catch (err) {
    next(err)
  }
}

export async function exportData(req, res, next) {
  try {
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', req.user.id).single()
    const { data: sessions } = await supabaseAdmin.from('tool_sessions').select('*').eq('user_id', req.user.id)

    const exportPayload = {
      exported_at: new Date().toISOString(),
      profile: { ...profile, password: undefined },
      tool_sessions: sessions || [],
    }

    res.setHeader('Content-Disposition', 'attachment; filename="safie-dados.json"')
    res.setHeader('Content-Type', 'application/json')
    res.json(exportPayload)
  } catch (err) {
    next(err)
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const { confirmation } = req.body
    if (confirmation !== 'EXCLUIR') {
      return res.status(400).json({ error: 'validation', message: 'Digite "EXCLUIR" para confirmar a exclusão da conta.' })
    }

    const userId = req.user.id
    const anonymizedEmail = `deleted_${userId}@removed.safie`

    // Soft delete + anonimização de PII
    await supabaseAdmin.from('profiles').update({
      account_status: 'deleted',
      deleted_at: new Date().toISOString(),
      full_name: 'Usuário Removido',
      email: anonymizedEmail,
      phone: null,
      avatar_url: null,
      bio: null,
      linkedin_url: null,
    }).eq('id', userId)

    // Impede login futuro
    await supabaseAdmin.auth.admin.deleteUser(userId)

    logger.info('Conta excluída', { userId, ip: req.ip })

    res.json({ message: 'Conta excluída. Seus dados serão removidos completamente em 30 dias.' })
  } catch (err) {
    next(err)
  }
}
