import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit(data) {
    try {
      setServerError('')
      await signIn(data.email, data.password)
      navigate('/dashboard')
    } catch {
      setServerError('E-mail ou senha incorretos. Verifique seus dados e tente novamente.')
    }
  }

  async function handleGoogleSignIn() {
    try {
      setServerError('')
      setGoogleLoading(true)
      await signInWithGoogle()
      // Após o redirect do OAuth, o OAuthGuard em App.jsx cuida do redirecionamento
    } catch {
      setServerError('Não foi possível iniciar o login com o Google. Tente novamente.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-bg-dark">Entrar na sua conta</h1>
          <p className="font-body text-sm text-gray-500 mt-2">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-primary font-semibold hover:underline">
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>

        <Card variant="elevated">
          <div className="flex flex-col gap-5">
            {/* Botão Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || isSubmitting}
              className="
                w-full flex items-center justify-center gap-3
                px-4 py-3 rounded-lg border border-gray-200
                bg-white font-cta text-sm font-medium text-gray-700
                hover:bg-gray-50 hover:border-gray-300
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              <GoogleIcon />
              {googleLoading ? 'Redirecionando...' : 'Continuar com Google'}
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="font-body text-xs text-gray-400">ou entre com e-mail</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Formulário e-mail/senha */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <Input
                label="E-mail"
                name="email"
                type="email"
                placeholder="seu@email.com"
                register={register}
                required
                error={errors.email}
              />
              <div>
                <Input
                  label="Senha"
                  name="password"
                  type="password"
                  placeholder="Sua senha"
                  register={register}
                  required
                  error={errors.password}
                />
                <div className="flex justify-end mt-1">
                  <Link to="/esqueci-senha" className="font-body text-sm text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
              </div>

              {serverError && (
                <p className="font-body text-sm text-red-500 text-center">{serverError}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || googleLoading}
                className="w-full"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
