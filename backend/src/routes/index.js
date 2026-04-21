import { Router } from 'express'
import authRoutes from './auth.js'
import toolsRoutes from './tools.js'
import hubspotRoutes from './hubspot.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/tools', toolsRoutes)
router.use('/hubspot', hubspotRoutes)

export default router
