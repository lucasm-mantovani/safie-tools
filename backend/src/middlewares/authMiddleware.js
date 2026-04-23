import { supabaseAdmin } from '../config/supabase.js'
import { logger } from '../utils/logger.js'

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('401 sem token', { endpoint: `${req.method} ${req.path}`, ip: req.ip })
    return res.status(401).json({ error: 'unauthorized', message: 'Sessão inválida. Faça login novamente.' })
  }

  const token = authHeader.split(' ')[1]

  if (!token || token.length < 10) {
    logger.warn('401 token malformado', { endpoint: `${req.method} ${req.path}`, ip: req.ip })
    return res.status(401).json({ error: 'unauthorized', message: 'Sessão inválida. Faça login novamente.' })
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      logger.warn('401 token inválido', { endpoint: `${req.method} ${req.path}`, ip: req.ip })
      return res.status(401).json({ error: 'unauthorized', message: 'Sessão inválida. Faça login novamente.' })
    }

    req.user = user
    next()
  } catch (err) {
    logger.error('Erro ao validar token', { endpoint: `${req.method} ${req.path}`, message: err.message })
    res.status(401).json({ error: 'unauthorized', message: 'Sessão inválida. Faça login novamente.' })
  }
}
