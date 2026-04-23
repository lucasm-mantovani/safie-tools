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
    async function handleCallback() {
      const type = searchParams.get('type')

      // Tokens passados diretamente (fluxo backend OAuth callback)
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (sessionError) {
          setError('Falha ao estabelecer sessão. Tente novamente.')
          setTimeout(() => navigate('/login?error=oauth_failed'), 2000)
          return
        }
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Sessão não encontrada.')
        setTimeout(() => navigate('/login?error=oauth_failed'), 2000)
        return
      }

      if (type === 'signup') {
        // E-mail confirmado com sucesso
        await refreshProfile?.()
        setTimeout(() => navigate('/dashboard'), 2000)
        return
      }

      if (type === 'recovery') {
        navigate(`/reset-password?token=${session.access_token}`)
        return
      }

      await refreshProfile?.()
      navigate('/dashboard', { replace: true })
    }

    handleCallback()
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
