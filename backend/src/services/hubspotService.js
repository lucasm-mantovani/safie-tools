import { hubspotClient } from '../config/hubspot.js'

export const hubspotService = {
  async createContact({ full_name, email, phone, company_name, business_segment }) {
    const [firstname, ...lastnameParts] = (full_name || 'Usuário').trim().split(' ')
    const lastname = lastnameParts.join(' ')

    try {
      const response = await hubspotClient.crm.contacts.basicApi.create({
        properties: {
          firstname,
          lastname,
          email,
          phone: phone || '',
          company: company_name || '',
          safie_tools_registered: 'true',
          safie_tools_sessions_count: '0',
          ...(business_segment && { industry: business_segment }),
        },
      })

      return response.id
    } catch (err) {
      // A SDK do HubSpot expõe o status HTTP em err.statusCode (não em err.code)
      // 409 = Conflict: contato com este e-mail já existe
      if (err.statusCode === 409 || err.code === 409) {
        return await hubspotService.findContactByEmail(email)
      }
      throw err
    }
  },

  async findContactByEmail(email) {
    try {
      const result = await hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{ propertyName: 'email', operator: 'EQ', value: email }],
        }],
        properties: ['email', 'firstname', 'lastname'],
        limit: 1,
      })
      return result.results[0]?.id || null
    } catch (err) {
      console.error('[HubSpot] Falha ao buscar contato por e-mail:', err.message)
      return null
    }
  },

  async updateContact(contactId, properties) {
    await hubspotClient.crm.contacts.basicApi.update(contactId, { properties })
  },

  async incrementSessionCount(contactId, currentCount) {
    await hubspotClient.crm.contacts.basicApi.update(contactId, {
      properties: {
        safie_tools_sessions_count: String((currentCount || 0) + 1),
      },
    })
  },
}
