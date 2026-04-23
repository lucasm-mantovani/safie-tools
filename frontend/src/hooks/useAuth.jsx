import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { supabase } from '../services/supabase'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileChecked, setProfileChecked] = useState(false)

  // Bloqueia fetchProfile durante fluxo de signUp para evitar redirect prematuro
  const isRegistering = useRef(false)

  const needsProfileCompletion = !loading && profileChecked && user !== null && profile === null

  useEffect(() => {
    let mounted = true

    // Timeout de segurança: garante que loading resolve mesmo se Supabase travar
    const timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false)
        setProfileChecked(true)
      }
    }, 8000)

    // Bootstrap: define auth imediatamente e busca perfil em background
    // loading=false logo após saber o estado de auth para evitar tela de carregamento longa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      clearTimeout(timeoutId)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user && !isRegistering.current) {
        fetchProfile(session.user.id)
      } else {
        setProfileChecked(true)
      }
    })

    // Listener: apenas para mudanças de estado após o bootstrap
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return

      setUser(session?.user ?? null)

      if (session?.user) {
        if (!isRegistering.current) {
          await fetchProfile(session.user.id)
        }
      } else {
        setProfile(null)
        setProfileChecked(false)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // PGRST116 = nenhuma linha encontrada: perfil genuinamente não existe
        if (error.code === 'PGRST116') setProfile(null)
        // Outros erros (rede, timeout): mantém o perfil atual para evitar redirect falso
        return
      }
      setProfile(data)
    } catch {
      // Erro de rede: mantém o perfil atual
    } finally {
      setProfileChecked(true)
    }
  }

  // Login: backend valida credenciais e aplica rate limit; Supabase client armazena sessão nativamente
  async function signIn(email, password) {
    // Valida credenciais e aplica rate limiting no backend
    await api.post('/auth/login', { email, password })

    // Faz login diretamente no Supabase para garantir que a sessão seja armazenada
    // pelo mecanismo nativo (localStorage), evitando problemas com setSession + PKCE
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Busca perfil imediatamente para evitar race condition entre navigate e o listener de auth
    await fetchProfile(data.user.id)

    return data
  }

  // Registro via backend (valida, cria usuário, cria perfil, envia e-mail de confirmação)
  async function signUp(formData) {
    const { full_name, email, password, phone, company_name, business_segment } = formData

    isRegistering.current = true
    try {
      await api.post('/auth/register', { full_name, email, password, phone, company_name, business_segment })
      // Após registro via backend, o usuário deve confirmar o e-mail antes de logar
      // Retorna sem sessão — a UI deve mostrar mensagem de confirmação
      return { needsEmailConfirmation: true }
    } finally {
      isRegistering.current = false
    }
  }

  // Cria perfil para usuários que não completaram o cadastro
  // Usa o backend (service role key) em vez do Supabase direto para evitar bloqueios de RLS e token refresh
  async function registerProfile(formData) {
    const { full_name, phone, company_name, business_segment } = formData

    const { data } = await api.post('/auth/complete-profile', {
      user_id: user.id,
      full_name,
      email: user.email,
      phone,
      company_name,
      business_segment,
    })

    setProfile(data.profile)
    setProfileChecked(true)

    return data.profile
  }

  // Logout global — invalida todas as sessões no servidor
  async function signOut() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Mesmo se o backend falhar, limpa o estado local
    } finally {
      setUser(null)
      setProfile(null)
      setProfileChecked(false)
      await supabase.auth.signOut()
    }
  }

  function refreshProfile() {
    if (user) return fetchProfile(user.id)
  }

  async function forgotPassword(email) {
    await api.post('/auth/forgot-password', { email })
  }

  async function resetPassword(token, newPassword) {
    await api.post('/auth/reset-password', { access_token: token, new_password: newPassword })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileChecked,
        needsProfileCompletion,
        signIn,
        signUp,
        signOut,
        registerProfile,
        refreshProfile,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
