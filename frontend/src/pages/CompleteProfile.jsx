import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function CompleteProfile() {
  const { user, registerProfile } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  // Pré-preenche o nome se já veio do Google
  const googleName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { full_name: googleName },
  })

  async function onSubmit(data) {
    try {
      setServerError('')
      await registerProfile(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.message || 'Erro ao salvar perfil. Tente novamente.')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Ícone de boas-vindas */}
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-bg-dark">
            Bem-vindo à SAFIE Tools
          </h1>
          <p className="font-body text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            Para personalizar sua experiência, precisamos de mais algumas informações sobre você e sua empresa.
          </p>
          {user?.email && (
            <p className="font-body text-xs text-gray-400 mt-2">
              Conta vinculada: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        <Card variant="elevated">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="Nome completo"
              name="full_name"
              placeholder="Seu nome completo"
              register={register}
              required
              error={errors.full_name}
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

            {/* Campo de segmento com select para melhor UX */}
            <div className="flex flex-col gap-1">
              <label htmlFor="business_segment" className="font-body text-sm font-medium text-gray-700">
                Segmento do negócio
              </label>
              <select
                id="business_segment"
                {...register('business_segment')}
                className="
                  w-full px-4 py-3 rounded-lg border border-gray-200
                  bg-white font-body text-sm text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-all duration-200
                "
              >
                <option value="">Selecione seu segmento...</option>
                <option value="SaaS / Software">SaaS / Software</option>
                <option value="E-commerce / Marketplace">E-commerce / Marketplace</option>
                <option value="Agência / Consultoria">Agência / Consultoria</option>
                <option value="Fintech">Fintech</option>
                <option value="Edtech">Edtech</option>
                <option value="Healthtech">Healthtech</option>
                <option value="Legaltech">Legaltech</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {serverError && (
              <p className="font-body text-sm text-red-500 text-center">{serverError}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? 'Salvando...' : 'Acessar as ferramentas'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
