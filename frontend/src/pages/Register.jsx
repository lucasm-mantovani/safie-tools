import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit(data) {
    try {
      setServerError('')
      await signUp(data)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.message?.includes('already registered')
        ? 'Este e-mail já está cadastrado. Tente entrar na sua conta.'
        : (err.message || 'Erro ao criar conta. Tente novamente.')
      setServerError(msg)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-bg-dark">Criar conta gratuita</h1>
          <p className="font-body text-sm text-gray-500 mt-2">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <Card variant="elevated">
          <div className="flex flex-col gap-5">
            {/* Formulário e-mail/senha */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <Input
                label="Nome completo"
                name="full_name"
                placeholder="Seu nome completo"
                register={register}
                required
                validation={{ minLength: { value: 2, message: 'Nome muito curto' } }}
                error={errors.full_name}
              />
              <Input
                label="E-mail"
                name="email"
                type="email"
                placeholder="seu@email.com"
                register={register}
                required
                validation={{ pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' } }}
                error={errors.email}
              />
              <Input
                label="Telefone / WhatsApp"
                name="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                register={register}
                error={errors.phone}
              />
              <Input
                label="Nome da empresa"
                name="company_name"
                placeholder="Razão social ou nome fantasia"
                register={register}
                error={errors.company_name}
              />
              <Input
                label="Segmento do negócio"
                name="business_segment"
                placeholder="Ex: SaaS, E-commerce, Agência..."
                register={register}
                error={errors.business_segment}
              />
              <Input
                label="Senha"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                register={register}
                required
                validation={{ minLength: { value: 8, message: 'Senha deve ter ao menos 8 caracteres' } }}
                error={errors.password}
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
                {isSubmitting ? 'Criando conta...' : 'Criar conta gratuitamente'}
              </Button>

              <p className="font-body text-xs text-gray-400 text-center">
                Ao criar sua conta, você concorda com os{' '}
                <a href="#" className="text-primary hover:underline">Termos de Uso</a>
                {' '}da SAFIE.
              </p>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
