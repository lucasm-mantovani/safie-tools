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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') return

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

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setProfile(data || null)
    } catch {
      setProfile(null)
    } finally {
      setProfileChecked(true)
      setLoading(false)
    }
  }

  // Login via backend (registra tentativas, rate limit por e-mail)
  async function signIn(email, password) {
    const { data } = await api.post('/auth/login', { email, password })

    // Seta sessão no cliente Supabase com os tokens retornados pelo backend
    const { error } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
    if (error) throw error

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

  // OAuth Google — frontend inicia o fluxo PKCE diretamente (verifier fica no localStorage do browser)
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }

  // Cria perfil para usuários OAuth que não completaram o cadastro (fluxo legacy)
  async function registerProfile(formData) {
    const { full_name, phone, company_name, business_segment } = formData

    const { data: profileData, error } = await supabase
      .from('profiles')
      .insert({ id: user.id, full_name, email: user.email, phone, company_name, business_segment })
      .select()
      .single()

    if (error) throw new Error(error.message)

    setProfile(profileData)
    setProfileChecked(true)

    return profileData
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
        signInWithGoogle,
        signOut,
        registerProfile,
        refreshProfile,
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
