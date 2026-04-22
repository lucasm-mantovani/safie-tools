import { Router } from 'express'
import {
  listTools, saveSession, getSessionsByUser,
  createEquitySession, getEquitySession, getEquitySessionsByUser,
  createEquityInvite, createEquityShare, getEquityBenchmark,
  calculateTaxBetter, calculateLaborRisk, calculateFastDueDiligence,
  calculateLitigationCost, calculatePartnersCash,
} from '../controllers/toolsController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import {
  validate, equitySessionSchema, equityInviteSchema,
  taxBetterSchema, laborRiskSchema, fastDueDiligenceSchema,
  litigationCostSchema, partnersCashSchema,
} from '../utils/validators.js'

const router = Router()

router.get('/', listTools)

// Equity Calculator
router.post('/equity-calculator/session', authMiddleware, validate(equitySessionSchema), createEquitySession)
router.get('/equity-calculator/sessions', authMiddleware, getEquitySessionsByUser)
router.get('/equity-calculator/session/:id', authMiddleware, getEquitySession)
router.post('/equity-calculator/invite', authMiddleware, validate(equityInviteSchema), createEquityInvite)
router.post('/equity-calculator/share', authMiddleware, createEquityShare)
router.get('/equity-calculator/benchmark', authMiddleware, getEquityBenchmark)

// POST /api/tools/tax-better — diagnóstico de regime tributário
router.post('/tax-better', authMiddleware, validate(taxBetterSchema), calculateTaxBetter)

// POST /api/tools/labor-risk — avalia risco trabalhista de contratos PJ
router.post('/labor-risk', authMiddleware, validate(laborRiskSchema), calculateLaborRisk)

// POST /api/tools/fast-due-diligence
router.post('/fast-due-diligence', authMiddleware, validate(fastDueDiligenceSchema), calculateFastDueDiligence)

// POST /api/tools/litigation-cost
router.post('/litigation-cost', authMiddleware, validate(litigationCostSchema), calculateLitigationCost)

// POST /api/tools/partners-cash
router.post('/partners-cash', authMiddleware, validate(partnersCashSchema), calculatePartnersCash)

// POST /api/tools/sessions — salva sessão de uso de ferramenta
router.post('/sessions', authMiddleware, saveSession)

// GET /api/tools/sessions — retorna histórico de sessões do usuário
router.get('/sessions', authMiddleware, getSessionsByUser)

export default router
