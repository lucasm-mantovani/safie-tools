import { Router } from 'express'
import {
  listTools, saveSession, getSessionsByUser,
  createEquitySession, getEquitySession, getEquitySessionsByUser,
  createEquityInvite, createEquityShare, getEquityBenchmark,
  calculateTaxBetter, calculateLaborRisk, calculateFastDueDiligence,
  calculateLitigationCost, calculatePartnersCash,
  createTaxDiagnosticSession, getTaxDiagnosticSession,
  getTaxDiagnosticSessionsByUser, getTaxDiagnosticBenchmark,
  createDueDiligenceSession, getDueDiligenceSession, getDueDiligenceSessionsByUser,
} from '../controllers/toolsController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import {
  validate, equitySessionSchema, equityInviteSchema,
  taxBetterSchema, laborRiskSchema, fastDueDiligenceSchema,
  litigationCostSchema, partnersCashSchema, taxDiagnosticSchema,
  dueDiligenceSessionSchema,
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

// POST /api/tools/tax-better — diagnóstico legado
router.post('/tax-better', authMiddleware, validate(taxBetterSchema), calculateTaxBetter)

// Tax Diagnostic — rotas completas
router.post('/tax-diagnostic/session', authMiddleware, validate(taxDiagnosticSchema), createTaxDiagnosticSession)
router.get('/tax-diagnostic/sessions', authMiddleware, getTaxDiagnosticSessionsByUser)
router.get('/tax-diagnostic/session/:id', authMiddleware, getTaxDiagnosticSession)
router.get('/tax-diagnostic/benchmark', authMiddleware, getTaxDiagnosticBenchmark)

// POST /api/tools/labor-risk — avalia risco trabalhista de contratos PJ
router.post('/labor-risk', authMiddleware, validate(laborRiskSchema), calculateLaborRisk)

// POST /api/tools/fast-due-diligence (legado — mantido para compatibilidade)
router.post('/fast-due-diligence', authMiddleware, validate(fastDueDiligenceSchema), calculateFastDueDiligence)

// Due Diligence Checklist — rotas completas
router.post('/due-diligence/session', authMiddleware, validate(dueDiligenceSessionSchema), createDueDiligenceSession)
router.get('/due-diligence/sessions', authMiddleware, getDueDiligenceSessionsByUser)
router.get('/due-diligence/session/:id', authMiddleware, getDueDiligenceSession)

// POST /api/tools/litigation-cost
router.post('/litigation-cost', authMiddleware, validate(litigationCostSchema), calculateLitigationCost)

// POST /api/tools/partners-cash
router.post('/partners-cash', authMiddleware, validate(partnersCashSchema), calculatePartnersCash)

// POST /api/tools/sessions — salva sessão de uso de ferramenta
router.post('/sessions', authMiddleware, saveSession)

// GET /api/tools/sessions — retorna histórico de sessões do usuário
router.get('/sessions', authMiddleware, getSessionsByUser)

export default router
