import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas. Verifique o arquivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// Troca o storage quando o usuário define "Lembrar de mim"
export function setAuthPersistence(remember) {
  if (typeof window === 'undefined') return
  supabase.auth.setSession
  // Supabase v2 não permite trocar storage após inicialização
  // Solução: guardar preferência e reinicializar no próximo login
  window.__safie_remember_me = remember
  if (!remember) {
    localStorage.removeItem(`sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`)
  }
}
