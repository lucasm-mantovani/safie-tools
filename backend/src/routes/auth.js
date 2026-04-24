import { Router } from 'express'
import { getProfile, updateProfile } from '../controllers/authController.js'
import {
  registerUser, loginUser, logoutUser,
  getGoogleOAuthUrl, handleOAuthCallback,
  forgotPassword, resetPassword,
  listSessions, revokeSession,
} from '../controllers/authNewController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { authLimiter } from '../utils/rateLimiter.js'
import { validate, updateProfileSchema } from '../utils/validators.js'

const router = Router()

// ── Novas rotas de autenticação (backend-initiated) ──────────────────────────

// Registro via backend (cria usuário no Supabase + perfil)
router.post('/register', authLimiter, registerUser)

// Login com registro de tentativas e rate limit por e-mail
router.post('/login', authLimiter, loginUser)

// Logout global (invalida todas as sessões do dispositivo)
router.post('/logout', authMiddleware, logoutUser)

// OAuth Google
router.get('/google', authLimiter, getGoogleOAuthUrl)
router.get('/callback', handleOAuthCallback)

// Recuperação de senha
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', resetPassword)

// Gestão de sessões ativas
router.get('/sessions', authMiddleware, listSessions)
router.delete('/sessions/:id', authMiddleware, revokeSession)

// Perfil do usuário autenticado
router.get('/profile', authMiddleware, getProfile)
router.patch('/profile', authMiddleware, validate(updateProfileSchema), updateProfile)

export default router
