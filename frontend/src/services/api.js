import axios from 'axios'
import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Injeta token JWT e faz refresh preventivo se expira em menos de 5 minutos
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    const expiresAt = session.expires_at * 1000
    const fiveMinutes = 5 * 60 * 1000

    if (Date.now() + fiveMinutes > expiresAt) {
      const { data: refreshed, error } = await supabase.auth.refreshSession()
      if (error || !refreshed.session) {
        await supabase.auth.signOut()
        window.location.href = '/login?reason=session_expired'
        return Promise.reject(new Error('Sessão expirada'))
      }
      config.headers.Authorization = `Bearer ${refreshed.session.access_token}`
      return config
    }

    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      supabase.auth.signOut()
      window.location.href = '/login?reason=session_expired'
      return Promise.reject(new Error('Sua sessão expirou. Faça login novamente.'))
    }

    const message = error.response?.data?.message
      || (status ? `Erro ${status} — tente novamente.` : 'Sem resposta do servidor. Verifique sua conexão.')

    if (import.meta.env.DEV) {
      console.error('[API]', error.config?.url, status || 'network error')
    }

    return Promise.reject(new Error(message))
  },
)
