import { Router } from 'express'
import { listTools, saveSession, getSessionsByUser, calculateEquity, calculateTaxBetter } from '../controllers/toolsController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { validate, equityCalculatorSchema, taxBetterSchema } from '../utils/validators.js'

const router = Router()

// GET /api/tools — lista todas as ferramentas ativas
router.get('/', listTools)

// POST /api/tools/equity-calculator — calcula divisão de participações societárias
router.post('/equity-calculator', authMiddleware, validate(equityCalculatorSchema), calculateEquity)

// POST /api/tools/tax-better — diagnóstico de regime tributário
router.post('/tax-better', authMiddleware, validate(taxBetterSchema), calculateTaxBetter)

// POST /api/tools/sessions — salva sessão de uso de ferramenta
router.post('/sessions', authMiddleware, saveSession)

// GET /api/tools/sessions — retorna histórico de sessões do usuário
router.get('/sessions', authMiddleware, getSessionsByUser)

export default router
