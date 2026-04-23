import { Router } from 'express'
import authRoutes from './auth.js'
import profileRoutes from './profile.js'
import toolsRoutes from './tools.js'
import hubspotRoutes from './hubspot.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/profile', profileRoutes)
router.use('/tools', toolsRoutes)
router.use('/hubspot', hubspotRoutes)

export default router
