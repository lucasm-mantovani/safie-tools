import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit(data) {
    try {
      setServerError('')
      await forgotPassword(data.email)
      setSubmitted(true)
    } catch {
      setServerError('Não foi possível enviar o e-mail. Tente novamente em alguns instantes.')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-bg-dark">Recuperar senha</h1>
          <p className="font-body text-sm text-gray-500 mt-2">
            Informe seu e-mail e enviaremos as instruções.
          </p>
        </div>

        <Card variant="elevated">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-body text-sm text-gray-700">
                Se este e-mail estiver cadastrado, você receberá as instruções em breve.
              </p>
              <p className="font-body text-xs text-gray-400">
                Verifique também a pasta de spam.
              </p>
              <Link to="/login" className="font-body text-sm text-primary hover:underline mt-2">
                ← Voltar para o login
              </Link>
            </div>
          ) : (
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
                {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="font-body text-sm text-primary hover:underline">
                  ← Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
