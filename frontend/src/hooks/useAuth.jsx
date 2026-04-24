import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../services/supabase'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const timeoutId = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 8000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      clearTimeout(timeoutId)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) fetchProfile(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return

      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
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
      if (!error && data) setProfile(data)
    } catch {
      // Erro de rede: mantém profile atual
    }
  }

  async function signIn(email, password) {
    await api.post('/auth/login', { email, password })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await fetchProfile(data.user.id)
    return data
  }

  async function signUp(formData) {
    const { full_name, email, password, phone, company_name, business_segment } = formData
    await api.post('/auth/register', { full_name, email, password, phone, company_name, business_segment })
    return { needsEmailConfirmation: true }
  }

  async function signOut() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Mesmo se o backend falhar, limpa o estado local
    } finally {
      setUser(null)
      setProfile(null)
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
        signIn,
        signUp,
        signOut,
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
