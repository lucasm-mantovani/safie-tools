import { Router } from 'express'
import { createContact, updateContact, syncToolSession } from '../controllers/hubspotController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()

// POST /api/hubspot/contacts — cria contato no HubSpot
router.post('/contacts', authMiddleware, createContact)

// PATCH /api/hubspot/contacts/:contactId — atualiza propriedades do contato
router.patch('/contacts/:contactId', authMiddleware, updateContact)

// POST /api/hubspot/sync — sincroniza dados de qualificação de ferramenta
router.post('/sync', authMiddleware, syncToolSession)

export default router
