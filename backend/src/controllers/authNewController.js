import { supabaseAdmin } from '../config/supabase.js'
import { hubspotService } from '../services/hubspotService.js'
import { logger } from '../utils/logger.js'
import crypto from 'crypto'

const PHONE_REGEX = /^\+?55?\s?\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}$/
const SEGMENTS = ['tech', 'saude', 'varejo', 'servicos', 'industria', 'educacao', 'financeiro', 'outros']

function syncHubspotAsync(userId, contactData) {
  ;(async () => {
    try {
      const hubspotId = await hubspotService.createContact(contactData)
      if (hubspotId) {
        await supabaseAdmin.from('profiles').update({ hubspot_contact_id: hubspotId }).eq('id', userId)
      }
    } catch (err) {
      logger.error('[HubSpot] Falha ao criar contato', { userId, message: err.message })
    }
  })()
}

async function logLoginAttempt(email, ip, userAgent, success) {
  try {
    await supabaseAdmin.from('login_attempts').insert({ email, ip_address: ip, user_agent: userAgent, success })
  } catch (err) {
    logger.error('Falha ao registrar tentativa de login', { message: err.message })
  }
}

async function checkRateLimit(email) {
  const { count } = await supabaseAdmin
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .eq('success', false)
    .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())

  return (count || 0) >= 5
}

export async function registerUser(req, res, next) {
  try {
    const { full_name, email, password, phone, company_name, business_segment } = req.body

    if (!full_name || full_name.length < 2 || full_name.length > 100) {
      return res.status(400).json({ error: 'validation', message: 'Nome deve ter entre 2 e 100 caracteres.' })
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ error: 'validation', message: 'Senha deve ter ao menos 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.' })
    }
    if (phone && !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ error: 'validation', message: 'Telefone inválido. Use o formato brasileiro.' })
    }

    const { data: existing } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existing?.users?.some((u) => u.email === email)
    if (emailExists) {
      return res.status(409).json({ error: 'conflict', message: 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.' })
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name, phone, company_name, business_segment },
    })

    if (authError) throw authError

    const userId = authData.user.id

    await supabaseAdmin.from('profiles').insert({ id: userId, full_name, email, phone, company_name, business_segment })

    syncHubspotAsync(userId, { full_name, email, phone, company_name, business_segment })

    res.status(201).json({ message: 'Cadastro realizado! Verifique seu e-mail para confirmar a conta.' })
  } catch (err) {
    next(err)
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body
    const ip = req.ip
    const userAgent = req.headers['user-agent'] || ''

    if (!email || !password) {
      return res.status(400).json({ error: 'validation', message: 'E-mail e senha são obrigatórios.' })
    }

    const locked = await checkRateLimit(email)
    if (locked) {
      return res.status(429).json({ error: 'rate_limited', message: 'Muitas tentativas. Tente novamente em 15 minutos.' })
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      await logLoginAttempt(email, ip, userAgent, false)
      return res.status(401).json({ error: 'invalid_credentials', message: 'E-mail ou senha incorretos.' })
    }

    await logLoginAttempt(email, ip, userAgent, true)

    // Atualiza last_login_at e incrementa login_count
    await supabaseAdmin
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)

    await supabaseAdmin.rpc('increment_login_count', { user_id: data.user.id }).catch(() => {})

    res.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: { id: data.user.id, email: data.user.email },
    })
  } catch (err) {
    next(err)
  }
}

export async function logoutUser(req, res, next) {
  try {
    await supabaseAdmin.auth.admin.signOut(req.user.id, 'global')
    res.json({ message: 'Sessão encerrada com sucesso.' })
  } catch (err) {
    next(err)
  }
}

export async function getGoogleOAuthUrl(req, res, next) {
  try {
    const redirectTo = process.env.OAUTH_REDIRECT_URL
    const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, scopes: 'email profile' },
    })

    if (error) throw error
    res.json({ url: data.url })
  } catch (err) {
    next(err)
  }
}

export async function handleOAuthCallback(req, res, next) {
  try {
    const { code } = req.query
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`)
    }

    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code)

    if (error || !data.session) {
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`)
    }

    const userId = data.user.id
    const { data: existingProfile } = await supabaseAdmin.from('profiles').select('id').eq('id', userId).single()

    if (!existingProfile) {
      syncHubspotAsync(userId, {
        full_name: data.user.user_metadata?.full_name || '',
        email: data.user.email,
      })
    }

    res.redirect(`${frontendUrl}/auth/callback?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`)
  } catch (err) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/login?error=oauth_failed`)
  }
}

export async function forgotPassword(req, res, _next) {
  const { email } = req.body
  if (email) {
    try {
      await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?type=recovery`,
      })
    } catch {
      // Intencionalmente silencioso — nunca revelar se e-mail existe
    }
  }
  // Sempre retorna 200 independente de o e-mail existir ou não (evita enumeração)
  res.json({ message: 'Se este e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.' })
}

export async function resetPassword(req, res, next) {
  try {
    const { access_token, new_password } = req.body

    if (!new_password || new_password.length < 8 || !/[A-Z]/.test(new_password) || !/[0-9]/.test(new_password) || !/[^A-Za-z0-9]/.test(new_password)) {
      return res.status(400).json({ error: 'validation', message: 'Senha deve ter ao menos 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.' })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(access_token)
    if (authError || !user) {
      return res.status(401).json({ error: 'unauthorized', message: 'Link de redefinição inválido ou expirado.' })
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: new_password })
    if (error) throw error

    await supabaseAdmin.auth.admin.signOut(user.id, 'global')

    res.json({ message: 'Senha alterada com sucesso.' })
  } catch (err) {
    next(err)
  }
}

export async function listSessions(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_sessions')
      .select('id, ip_address, last_active, created_at, expires_at, user_agent_hash')
      .eq('user_id', req.user.id)
      .gt('expires_at', new Date().toISOString())
      .order('last_active', { ascending: false })

    if (error) throw error
    res.json({ sessions: data || [] })
  } catch (err) {
    next(err)
  }
}

export async function revokeSession(req, res, next) {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('user_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) throw error
    res.json({ message: 'Sessão encerrada.' })
  } catch (err) {
    next(err)
  }
}
