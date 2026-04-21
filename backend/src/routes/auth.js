import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { register, checkProfile, getProfile, updateProfile } from '../controllers/authController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { validate, registerSchema, updateProfileSchema } from '../utils/validators.js'

const router = Router()

// Rate limit mais restritivo para rotas de autenticação (evita brute force e abuso)
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { message: 'Muitas tentativas de autenticação. Aguarde 15 minutos.' },
})

// POST /api/auth/register — cria perfil + contato HubSpot após signUp do Supabase
// REQUER authMiddleware: o usuário deve estar autenticado no Supabase antes de chamar
// ATENÇÃO: exige que a confirmação de e-mail esteja DESABILITADA no Supabase
//          (Authentication → Providers → Email → "Confirm email" = OFF)
router.post('/register', authRateLimit, authMiddleware, validate(registerSchema), register)

// GET /api/auth/profile/check — verifica se perfil já existe (usado no fluxo OAuth)
// Retorna { exists: boolean, profile? } — nunca retorna 404
router.get('/profile/check', authMiddleware, checkProfile)

// GET /api/auth/profile — retorna perfil completo do usuário autenticado
router.get('/profile', authMiddleware, getProfile)

// PATCH /api/auth/profile — atualiza dados do perfil e sincroniza com HubSpot
router.patch('/profile', authMiddleware, validate(updateProfileSchema), updateProfile)

export default router
