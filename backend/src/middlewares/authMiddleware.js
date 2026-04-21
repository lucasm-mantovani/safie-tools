import { supabaseAdmin } from '../config/supabase.js'

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  if (!token || token.length < 10) {
    return res.status(401).json({ message: 'Token malformado' })
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ message: 'Token inválido ou expirado. Faça login novamente.' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('[Auth] Erro ao validar token:', err.message)
    res.status(401).json({ message: 'Erro de autenticação' })
  }
}
