import { api } from './api'

// Todas as chamadas ao HubSpot passam pelo backend — nunca diretamente do frontend
export async function createHubspotContact(profileData) {
  const { data } = await api.post('/hubspot/contacts', profileData)
  return data
}

export async function updateHubspotProperties(contactId, properties) {
  const { data } = await api.patch(`/hubspot/contacts/${contactId}`, { properties })
  return data
}
