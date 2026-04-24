import { useDD } from './DDContext'
import { useAuth } from '../../../hooks/useAuth'

const STAGE_OPTIONS_CAPTACAO = [
  { value: 'pre_revenue', label: 'Pré-receita' },
  { value: 'pre_seed', label: 'Pré-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b_plus', label: 'Series B+' },
]

const STAGE_OPTIONS_MA = [
  { value: 'bootstrapped', label: 'Bootstrapped (sem investimento externo)' },
  { value: 'venture_backed', label: 'Venture-backed (com investidores)' },
  { value: 'profitable', label: 'Lucrativa (self-sustaining)' },
]

const REVENUE_OPTIONS = [
  { value: 'pre_revenue', label: 'Pré-receita' },
  { value: 'ate_100k', label: 'Até R$ 100 mil/mês' },
  { value: '100k_500k', label: 'R$ 100 mil a R$ 500 mil/mês' },
  { value: '500k_2m', label: 'R$ 500 mil a R$ 2 milhões/mês' },
  { value: 'acima_2m', label: 'Acima de R$ 2 milhões/mês' },
]

const EMPLOYEES_OPTIONS = [
  { value: '1_5', label: '1 a 5 pessoas' },
  { value: '6_20', label: '6 a 20 pessoas' },
  { value: '21_50', label: '21 a 50 pessoas' },
  { value: '51_200', label: '51 a 200 pessoas' },
  { value: 'acima_200', label: 'Acima de 200 pessoas' },
]

const LEGAL_ADVISOR_OPTIONS = [
  { value: 'sim', label: 'Sim, especializado nesse tipo de operação' },
  { value: 'nao', label: 'Não tenho assessor jurídico' },
  { value: 'buscando', label: 'Estou buscando assessor' },
]

function SelectCard({ label, value, onChange, options }) {
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700 block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-xl border font-body text-sm transition-all ${
              value === opt.value
                ? 'bg-primary text-white border-primary font-medium'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function YesNo({ label, value, onChange }) {
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700 block mb-2">{label}</label>
      <div className="flex gap-3">
        {[{ v: true, l: 'Sim' }, { v: false, l: 'Não' }].map(opt => (
          <button
            key={String(opt.v)}
            onClick={() => onChange(opt.v)}
            className={`flex-1 py-2.5 rounded-xl border font-cta text-sm font-semibold transition-all ${
              value === opt.v
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/30'
            }`}
          >
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StepCompanySnapshot() {
  const { companySnapshot, operationType, updateSnapshot, goToStep } = useDD()
  const { profile } = useAuth()

  const companyName = companySnapshot.company_name || profile?.company_name || ''
  const segment = companySnapshot.business_segment || profile?.business_segment || ''

  const stageOptions = operationType === 'captacao' ? STAGE_OPTIONS_CAPTACAO : STAGE_OPTIONS_MA

  const contextNote = operationType === 'captacao'
    ? 'O diagnóstico de captação avalia sua prontidão para apresentar a empresa a fundos e investidores. Cobre governança, financeiro, produto, jurídico e os documentos específicos que investidores exigem.'
    : 'O diagnóstico de M&A avalia sua prontidão para um processo de fusão, aquisição ou venda de participação. Inclui verificações adicionais de auditoria, change of control e estrutura de transação.'

  const canAdvance = companyName && companySnapshot.current_stage &&
    companySnapshot.monthly_revenue_range && companySnapshot.employees_count_range &&
    companySnapshot.has_previous_funding !== null && companySnapshot.has_legal_advisor !== null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 mb-6">
        <p className="font-body text-sm text-primary leading-relaxed">{contextNote}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <h2 className="font-heading text-lg font-bold text-bg-dark">Sobre a empresa</h2>

        <div>
          <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Nome da empresa</label>
          <input
            type="text"
            value={companyName}
            onChange={e => updateSnapshot('company_name', e.target.value)}
            placeholder="Ex: ACME Tecnologia LTDA"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Segmento de negócio</label>
          <input
            type="text"
            value={segment}
            onChange={e => updateSnapshot('business_segment', e.target.value)}
            placeholder="Ex: SaaS B2B para gestão de RH"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Ano de fundação</label>
          <input
            type="number"
            value={companySnapshot.founding_year}
            onChange={e => updateSnapshot('founding_year', e.target.value ? Number(e.target.value) : '')}
            placeholder="Ex: 2020"
            min="1900"
            max="2030"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <SelectCard
          label="Estágio atual da empresa"
          value={companySnapshot.current_stage}
          onChange={v => updateSnapshot('current_stage', v)}
          options={stageOptions}
        />

        <SelectCard
          label="Faturamento mensal atual"
          value={companySnapshot.monthly_revenue_range}
          onChange={v => updateSnapshot('monthly_revenue_range', v)}
          options={REVENUE_OPTIONS}
        />

        <SelectCard
          label="Número de pessoas no time"
          value={companySnapshot.employees_count_range}
          onChange={v => updateSnapshot('employees_count_range', v)}
          options={EMPLOYEES_OPTIONS}
        />

        <YesNo
          label="A empresa já recebeu investimento externo?"
          value={companySnapshot.has_previous_funding}
          onChange={v => updateSnapshot('has_previous_funding', v)}
        />

        <SelectCard
          label="Você já tem assessor jurídico para essa operação?"
          value={companySnapshot.has_legal_advisor}
          onChange={v => updateSnapshot('has_legal_advisor', v)}
          options={LEGAL_ADVISOR_OPTIONS}
        />
      </div>

      <button
        onClick={() => goToStep('CHECKLIST')}
        disabled={!canAdvance}
        className="w-full mt-6 font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-5 py-3.5 rounded-xl"
      >
        Iniciar checklist →
      </button>
    </div>
  )
}
