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

    // Legacy: tokens passados diretamente na URL (email confirmation e recovery via backend)
    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error: sessionError }) => {
          if (sessionError) {
            setError('Falha ao estabelecer sessão. Tente novamente.')
            setTimeout(() => navigate('/login?error=oauth_failed'), 2000)
          }
          // SIGNED_IN via onAuthStateChange abaixo redireciona
        })
    }

    // PKCE: aguarda o Supabase completar a troca do code=... antes de redirecionar
    let timeoutId
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        clearTimeout(timeoutId)
        subscription.unsubscribe()
        if (type === 'recovery') {
          navigate(`/reset-password?token=${session.access_token}`, { replace: true })
          return
        }
        await refreshProfile?.()
        navigate('/dashboard', { replace: true })
      }
      if (event === 'PASSWORD_RECOVERY') {
        clearTimeout(timeoutId)
        subscription.unsubscribe()
        navigate(`/reset-password?token=${session?.access_token}`, { replace: true })
      }
    })

    timeoutId = setTimeout(() => {
      subscription.unsubscribe()
      setError('Tempo esgotado. Tente novamente.')
      setTimeout(() => navigate('/login?error=oauth_failed'), 2000)
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
