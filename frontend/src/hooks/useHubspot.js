import { api } from '../services/api'

// Hook para sincronizar dados de ferramentas com o HubSpot via backend
export function useHubspot() {
  async function syncToolSession(toolSlug, qualificationData) {
    try {
      await api.post('/hubspot/sync', { toolSlug, qualificationData })
    } catch (err) {
      // Falha silenciosa — nunca bloqueia a experiência do usuário
      console.error('Erro ao sincronizar HubSpot:', err)
    }
  }

  return { syncToolSession }
}
