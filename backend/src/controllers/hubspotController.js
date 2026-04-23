import { hubspotService } from '../services/hubspotService.js'

export async function createContact(req, res, next) {
  try {
    const contactId = await hubspotService.createContact(req.body)
    res.status(201).json({ contactId })
  } catch (err) {
    next(err)
  }
}

export async function updateContact(req, res, next) {
  try {
    const { contactId } = req.params
    const { properties } = req.body

    if (!properties || typeof properties !== 'object') {
      return res.status(400).json({ message: 'Campo "properties" é obrigatório e deve ser um objeto' })
    }

    await hubspotService.updateContact(contactId, properties)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
