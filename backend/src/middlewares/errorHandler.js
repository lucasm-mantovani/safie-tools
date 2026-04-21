export function errorHandler(err, req, res, _next) {
  console.error(`[ERRO] ${req.method} ${req.path} —`, err.message)

  // Erros conhecidos do Supabase
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Este registro já existe.' })
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referência inválida nos dados enviados.' })
  }
  if (err.code === 'PGRST116') {
    return res.status(404).json({ message: 'Registro não encontrado.' })
  }

  const status = err.status || err.statusCode || 500
  const message = status < 500
    ? (err.message || 'Requisição inválida')
    : 'Erro interno do servidor. Tente novamente em instantes.'

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { detail: err.message, stack: err.stack }),
  })
}
