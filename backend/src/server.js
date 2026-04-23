import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import routes from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3001

// Segurança
app.use(helmet())

const ALLOWED_ORIGINS = [
  'https://safie-tools.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
]
if (process.env.FRONTEND_URL) ALLOWED_ORIGINS.push(process.env.FRONTEND_URL)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: origem não permitida: ${origin}`))
  },
  credentials: true,
}))

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente em alguns minutos.' },
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rotas
app.use('/api', routes)

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Tratamento de erros (deve ser o último middleware)
app.use(errorHandler)

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 SAFIE Tools API rodando na porta ${PORT}`)
  })
}

export default app
