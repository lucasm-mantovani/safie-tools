import { useState } from 'react'
import { useTax } from './TaxContext'
import Button from '../../../components/ui/Button'

const ACTIVITY_OPTIONS = [
  { value: 'servicos', label: 'Prestação de serviços' },
  { value: 'produtos', label: 'Venda de produtos' },
  { value: 'misto', label: 'Serviços e produtos' },
]

const REGIME_OPTIONS = [
  { value: 'mei', label: 'MEI' },
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'nao_sei', label: 'Não sei informar' },
]

const STAGE_OPTIONS = [
  { value: 'idea', label: 'Ideia / pré-produto' },
  { value: 'mvp', label: 'MVP em desenvolvimento' },
  { value: 'early', label: 'Produto lançado, sem receita' },
  { value: 'revenue', label: 'Gerando receita' },
  { value: 'growth', label: 'Em crescimento acelerado' },
]

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

const QUESTIONS = [
  { key: 'activity_type', label: 'Qual é o tipo de atividade principal?', type: 'cards', options: ACTIVITY_OPTIONS },
  { key: 'current_regime', label: 'Qual é o regime tributário atual?', type: 'cards', options: REGIME_OPTIONS },
  { key: 'company_stage', label: 'Em que estágio está a empresa?', type: 'cards', options: STAGE_OPTIONS },
  { key: 'state', label: 'Em qual estado a empresa está registrada?', type: 'select', options: BR_STATES },
  { key: 'cnae', label: 'Qual é o CNAE principal? (opcional)', hint: 'Código de Atividade Econômica — ex: 6201-5/01', type: 'text', optional: true },
]

export default function StepCompanyProfile() {
  const { companyProfile, updateCompanyProfile, goToStep } = useTax()
  const [cnaeError, setCnaeError] = useState(null)
  const [pendingAnswer, setPendingAnswer] = useState(null)

  const activeIdx = QUESTIONS.findIndex(q => !q.optional && !companyProfile[q.key])
  const currentIdx = activeIdx === -1 ? QUESTIONS.length - 1 : activeIdx
  const activeQ = QUESTIONS[currentIdx]
  const allRequiredDone = QUESTIONS.filter(q => !q.optional).every(q => companyProfile[q.key])

  function handleCardClick(key, value) {
    setPendingAnswer({ key, value })
    setTimeout(() => {
      updateCompanyProfile(key, value)
      setPendingAnswer(null)
    }, 200)
  }

  function isCardSelected(key, value) {
    return companyProfile[key] === value || (pendingAnswer?.key === key && pendingAnswer?.value === value)
  }

  function handleCnaeBlur(e) {
    const val = e.target.value.trim()
    if (!val) {
      setCnaeError(null)
      return
    }
    if (!/^\d{4}-\d\/\d{2}$|^\d{7}$/.test(val)) {
      setCnaeError('Formato inválido. Use o padrão 0000-0/00 (ex: 6201-5/01)')
    } else {
      setCnaeError(null)
    }
  }

  return (
    <div>
      <div className="flex gap-1 mb-8">
        {QUESTIONS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
            i < currentIdx ? 'bg-primary' : i === currentIdx ? 'bg-primary/50' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-3">
          Pergunta {currentIdx + 1} de {QUESTIONS.length}
        </p>
        <h2 className="font-heading text-xl font-bold text-bg-dark mb-1">{activeQ.label}</h2>
        {activeQ.hint && <p className="font-body text-sm text-gray-400 mb-5">{activeQ.hint}</p>}
        {!activeQ.hint && <div className="mb-5" />}

        {activeQ.type === 'cards' && (
          <div className="flex flex-col gap-2">
            {activeQ.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleCardClick(activeQ.key, opt.value)}
                className={`text-left px-4 py-3 rounded-xl border font-body text-sm transition-all ${
                  isCardSelected(activeQ.key, opt.value)
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-primary/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {activeQ.type === 'select' && (
          <select
            value={companyProfile[activeQ.key] || ''}
            onChange={e => updateCompanyProfile(activeQ.key, e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          >
            <option value="">Selecione o estado...</option>
            {activeQ.options.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        {activeQ.type === 'text' && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={companyProfile[activeQ.key] || ''}
              onChange={e => updateCompanyProfile(activeQ.key, e.target.value)}
              onBlur={handleCnaeBlur}
              placeholder="Ex: 6201-5/01"
              className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${cnaeError ? 'border-red-300' : 'border-gray-200'}`}
            />
            {cnaeError && (
              <p className="font-body text-xs text-red-500">{cnaeError}</p>
            )}
            {!cnaeError && <p className="font-body text-xs text-gray-400">Campo opcional — pule se não souber.</p>}
          </div>
        )}
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={() => goToStep('REVENUE_DATA')}
        disabled={!allRequiredDone}
        className="w-full"
      >
        Continuar →
      </Button>
    </div>
  )
}
