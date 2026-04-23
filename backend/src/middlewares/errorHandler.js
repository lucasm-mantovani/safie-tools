import { logger } from '../utils/logger.js'

export function errorHandler(err, req, res, _next) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID()
  const userId = req.user?.id || 'unauthenticated'

  logger.error(`${req.method} ${req.path}`, { requestId, userId, message: err.message, code: err.code })

  if (err.code === '23505') {
    return res.status(409).json({ error: 'conflict', message: 'Este registro já existe.' })
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'bad_request', message: 'Referência inválida nos dados enviados.' })
  }
  if (err.code === 'PGRST116') {
    return res.status(404).json({ error: 'not_found', message: 'Registro não encontrado.' })
  }

  const status = err.status || err.statusCode || 500

  if (status < 500) {
    return res.status(status).json({ error: 'bad_request', message: err.message || 'Requisição inválida.' })
  }

  if (process.env.NODE_ENV !== 'production') {
    return res.status(500).json({ error: 'internal_error', message: err.message, stack: err.stack })
  }

  res.status(500).json({
    error: 'internal_error',
    message: 'Ocorreu um erro interno. Nossa equipe foi notificada.',
  })
}
