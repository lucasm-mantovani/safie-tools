import { Router } from 'express'
import { listTools, saveSession, getSessionsByUser, calculateEquity } from '../controllers/toolsController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { validate, equityCalculatorSchema } from '../utils/validators.js'

const router = Router()

// GET /api/tools — lista todas as ferramentas ativas
router.get('/', listTools)

// POST /api/tools/equity-calculator — calcula divisão de participações societárias
router.post('/equity-calculator', authMiddleware, validate(equityCalculatorSchema), calculateEquity)

// POST /api/tools/sessions — salva sessão de uso de ferramenta
router.post('/sessions', authMiddleware, saveSession)

// GET /api/tools/sessions — retorna histórico de sessões do usuário
router.get('/sessions', authMiddleware, getSessionsByUser)

export default router
