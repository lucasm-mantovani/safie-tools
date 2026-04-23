import rateLimit from 'express-rate-limit'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests', message: 'Muitas requisições. Tente novamente em alguns minutos.' },
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests', message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
})

// Rate limit por user_id (rotas autenticadas de ferramentas)
export function toolLimiter(req, res, next) {
  if (!req.user?.id) return next()
  const key = req.user.id
  if (!toolLimiter._store) toolLimiter._store = new Map()
  const store = toolLimiter._store
  const now = Date.now()
  const window = 60 * 60 * 1000

  const record = store.get(key) || { count: 0, resetAt: now + window }
  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + window
  }
  record.count++
  store.set(key, record)

  if (record.count > 20) {
    return res.status(429).json({
      error: 'too_many_requests',
      message: 'Limite de uso de ferramentas atingido. Tente novamente em 1 hora.',
    })
  }
  next()
}
