import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import PasswordStrengthIndicator from '../components/profile/PasswordStrengthIndicator'

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  const newPassword = watch('new_password', '')

  async function onSubmit(data) {
    try {
      setServerError('')
      await resetPassword(token, data.new_password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setServerError(err.message || 'Não foi possível redefinir a senha. O link pode ter expirado.')
    }
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center flex flex-col gap-4">
          <p className="font-body text-gray-700">Link de redefinição inválido ou expirado.</p>
          <Link to="/esqueci-senha" className="font-body text-sm text-primary hover:underline">
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-bg-dark">Criar nova senha</h1>
          <p className="font-body text-sm text-gray-500 mt-2">
            Mínimo 8 caracteres, com maiúscula, número e símbolo.
          </p>
        </div>

        <Card variant="elevated">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-body text-sm text-gray-700">
                Senha alterada com sucesso! Redirecionando para o login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div>
                <Input
                  label="Nova senha"
                  name="new_password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  register={register}
                  required
                  error={errors.new_password}
                />
                <PasswordStrengthIndicator password={newPassword} />
              </div>

              <Input
                label="Confirmar nova senha"
                name="confirm_password"
                type="password"
                placeholder="Repita a nova senha"
                register={register}
                required
                validation={{
                  validate: (value) => value === newPassword || 'As senhas não conferem',
                }}
                error={errors.confirm_password}
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
                {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
