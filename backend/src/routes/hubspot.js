import { Router } from 'express'
import { createContact, updateContact } from '../controllers/hubspotController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/contacts', authMiddleware, createContact)
router.patch('/contacts/:contactId', authMiddleware, updateContact)

export default router
