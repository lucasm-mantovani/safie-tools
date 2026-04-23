import axios from 'axios'
import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Injeta token JWT em toda requisição
// getSession com timeout de 5s para evitar bloqueio se o cliente Supabase estiver em estado inconsistente
api.interceptors.request.use(async (config) => {
  // FormData: remove Content-Type para o browser definir multipart/form-data com o boundary correto
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  try {
    const session = await Promise.race([
      supabase.auth.getSession().then(({ data }) => data.session),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ])
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch {
    // Se getSession falhar ou travar, segue sem token — backend retorna 401 e o response interceptor lida
  }
  return config
}, (error) => Promise.reject(error))

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    // Endpoints de autenticação (login, registro) retornam 401 por credenciais erradas,
    // não por sessão expirada — não redirecionar, apenas propagar o erro
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                           originalRequest.url?.includes('/auth/register')

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      // Tenta renovar o token uma vez antes de deslogar
      try {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
        if (!refreshError && refreshed?.session?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${refreshed.session.access_token}`
          return api(originalRequest)
        }
      } catch {
        // Refresh falhou — segue para encerramento de sessão
      }

      // Encerra sessão com timeout de 3s para não travar se o Supabase estiver lento
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ])
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
