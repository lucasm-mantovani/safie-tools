import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const type = searchParams.get('type')
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')

    let handled = false

    async function redirect(session, isRecovery) {
      if (handled) return
      handled = true

      if (isRecovery) {
        navigate(`/reset-password?token=${session?.access_token}`, { replace: true })
        return
      }
      await refreshProfile?.()
      navigate('/dashboard', { replace: true })
    }

    // Legacy: tokens passados diretamente na URL (email confirmation via backend)
    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error: sessionError }) => {
          if (sessionError && !handled) {
            handled = true
            setError('Falha ao estabelecer sessão. Tente novamente.')
            setTimeout(() => navigate('/login?error=oauth_failed'), 2000)
          }
          // SIGNED_IN via onAuthStateChange abaixo redireciona
        })
    }

    // Listener para eventos de auth (OAuth, PKCE code exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        clearTimeout(timeoutId)
        redirect(session, type === 'recovery')
      }
      if (event === 'PASSWORD_RECOVERY') {
        subscription.unsubscribe()
        clearTimeout(timeoutId)
        redirect(session, true)
      }
    })

    // Fallback: event pode ter disparado antes do listener ser registrado (race condition PKCE)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !handled) {
        subscription.unsubscribe()
        clearTimeout(timeoutId)
        redirect(session, type === 'recovery')
      }
    })

    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      if (!handled) {
        handled = true
        subscription.unsubscribe()
        setError('Tempo esgotado. Tente novamente.')
        setTimeout(() => navigate('/login?error=oauth_failed'), 2000)
      }
    }, 20000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-safie-light">
      <div className="flex flex-col items-center gap-3">
        {error ? (
          <p className="font-body text-sm text-red-600">{error}</p>
        ) : (
          <>
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-sm text-gray-500">Autenticando...</p>
          </>
        )}
      </div>
    </div>
  )
}
