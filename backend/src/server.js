import 'dotenv/config'
import './utils/validateEnv.js'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import routes from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { generalLimiter } from './utils/rateLimiter.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://accounts.google.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://*.supabase.co'],
      connectSrc: ["'self'", 'https://*.supabase.co', 'https://api.hubapi.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}))

const ALLOWED_ORIGINS = [
  'https://ferramentas.safie.com.br',
  'https://safie-tools.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
]
if (process.env.FRONTEND_URL) ALLOWED_ORIGINS.push(process.env.FRONTEND_URL)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(generalLimiter)
app.use(hpp())

// JSON limitado a 1MB; multipart/form-data é tratado pelo multer nas rotas de avatar
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

app.use('/api', routes)

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.use(errorHandler)

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`SAFIE Tools API rodando na porta ${PORT}`)
  })
}

export default app
