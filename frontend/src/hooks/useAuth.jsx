import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileChecked, setProfileChecked] = useState(false)

  // FIX 1: Flag que bloqueia o fetchProfile durante o fluxo de signUp()
  // Sem isso, onAuthStateChange(SIGNED_IN) dispara antes do api.post('/auth/register'),
  // encontra perfil inexistente e redireciona incorretamente para /completar-perfil
  const isRegistering = useRef(false)

  const needsProfileCompletion = !loading && profileChecked && user !== null && profile === null

  useEffect(() => {
    // FIX 5: Remove a função init() que causava duplo fetchProfile no carregamento
    // onAuthStateChange dispara INITIAL_SESSION automaticamente no mount,
    // tornando getSession() redundante e dobrando as chamadas ao Supabase

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // TOKEN_REFRESHED não precisa re-buscar o perfil
      if (event === 'TOKEN_REFRESHED') return

      setUser(session?.user ?? null)

      if (session?.user) {
        // FIX 1: Só busca o perfil se não estiver no meio de um signUp()
        // Durante signUp(), o setProfile() é chamado diretamente após o backend responder
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

  // FIX 6: Corrige o comentário — Supabase v2 não lança exceção com .single()
  // quando não encontra registro: retorna { data: null, error: { code: 'PGRST116' } }
  // O catch aqui trata erros reais (rede, permissão, etc.)
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

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(formData) {
    const { full_name, email, password, phone, company_name, business_segment } = formData

    // FIX 1: Sinaliza que estamos no fluxo de registro para suprimir o fetchProfile
    // disparado pelo onAuthStateChange(SIGNED_IN) que ocorre durante o signUp
    isRegistering.current = true

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, phone, company_name, business_segment },
        },
      })
      // Erros do Supabase Auth são relançados (ex: e-mail já cadastrado, senha fraca)
      if (error) throw error

      // FIX 3: Se o backend falhar, não relança o erro — o usuário completará
      // o perfil via /completar-perfil (mesmo fluxo do OAuth)
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({ id: authData.user.id, full_name, email, phone, company_name, business_segment })
          .select()
          .single()

        if (profileError) throw profileError
        setProfile(profile)
        setProfileChecked(true)
      } catch (profileErr) {
        console.error('[Auth] Falha ao registrar perfil:', profileErr.message)
        setProfile(null)
        setProfileChecked(true)
      }

      return authData
    } finally {
      // Sempre libera o flag, mesmo que ocorra um erro no Supabase Auth
      isRegistering.current = false
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) throw error
  }

  // Cria perfil para usuários OAuth que não completaram o cadastro
  async function registerProfile(formData) {
    const { full_name, phone, company_name, business_segment } = formData

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({ id: user.id, full_name, email: user.email, phone, company_name, business_segment })
      .select()
      .single()

    if (error) throw new Error(error.message)

    setProfile(profile)
    setProfileChecked(true)

    return profile
  }

  async function signOut() {
    setUser(null)
    setProfile(null)
    setProfileChecked(false)
    await supabase.auth.signOut()
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
