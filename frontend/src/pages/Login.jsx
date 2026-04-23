import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit(data) {
    try {
      setServerError('')
      await signIn(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.message || 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.')
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
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
