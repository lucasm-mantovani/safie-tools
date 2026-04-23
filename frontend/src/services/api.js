import axios from 'axios'
import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o token JWT do Supabase em todas as requisições autenticadas
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Tratamento centralizado de erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message
      || (status ? `Erro ${status} — tente novamente.` : 'Sem resposta do servidor. Verifique sua conexão.')
    console.error('[API]', error.config?.url, status || 'network error', error.response?.data || error.message)
    return Promise.reject(new Error(message))
  },
)
