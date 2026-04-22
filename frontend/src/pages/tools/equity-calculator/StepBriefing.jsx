// TODO: implementar — 5 perguntas sequenciais com auto-calibração de pesos na Q2
import { useEquity } from './EquityContext'
import Button from '../../../components/ui/Button'

const STAGE_OPTIONS = [
  { value: 'idea', label: 'Ideia / pré-produto' },
  { value: 'mvp', label: 'MVP em desenvolvimento' },
  { value: 'early', label: 'Produto lançado, sem receita' },
  { value: 'revenue', label: 'Gerando receita' },
  { value: 'growth', label: 'Em crescimento acelerado' },
]

const FOUNDERS_TYPE_WEIGHTS = {
  technical: { capital: 20, work: 40, knowledge: 25, risk: 15 },
  business:  { capital: 35, work: 30, knowledge: 20, risk: 15 },
  mixed:     { capital: 30, work: 35, knowledge: 20, risk: 15 },
  investor:  { capital: 50, work: 15, knowledge: 20, risk: 15 },
}

const FOUNDERS_OPTIONS = [
  { value: 'technical', label: 'Técnico (dev, produto, dados)' },
  { value: 'business',  label: 'Negócios (comercial, operações)' },
  { value: 'mixed',     label: 'Misto (técnico + negócios)' },
  { value: 'investor',  label: 'Investidor (aporte financeiro)' },
]

const AGREEMENT_OPTIONS = [
  { value: 'sim',                      label: 'Sim, temos acordo de sócios' },
  { value: 'em_elaboracao',            label: 'Em elaboração com advogado' },
  { value: 'rascunho_sem_advogado',    label: 'Temos rascunho informal' },
  { value: 'nao',                      label: 'Não temos' },
]

const SEGMENT_OPTIONS = [
  'SaaS B2B', 'SaaS B2C', 'Marketplace', 'E-commerce', 'Fintech',
  'Healthtech', 'Edtech', 'Agtech', 'Legaltech', 'Consultoria', 'Outro',
]

const PARTNER_COUNT_OPTIONS = [2, 3, 4, 5, 6]

const QUESTIONS = [
  {
    key: 'company_stage',
    label: 'Em que estágio está a empresa?',
    type: 'cards',
    options: STAGE_OPTIONS,
  },
  {
    key: 'founders_type',
    label: 'Qual é o perfil predominante dos sócios?',
    hint: 'Isso calibrará os pesos das dimensões automaticamente.',
    type: 'cards',
    options: FOUNDERS_OPTIONS,
  },
  {
    key: 'has_shareholders_agreement',
    label: 'A empresa tem acordo de sócios?',
    type: 'cards',
    options: AGREEMENT_OPTIONS,
  },
  {
    key: 'business_segment',
    label: 'Qual é o segmento do negócio?',
    type: 'select',
    options: SEGMENT_OPTIONS,
  },
  {
    key: 'partner_count',
    label: 'Quantos sócios serão avaliados?',
    type: 'count',
    options: PARTNER_COUNT_OPTIONS,
  },
]

export default function StepBriefing() {
  const { businessBriefing, updateBriefing, setSuggestedWeights, setPartnerCount, goToStep, partners } = useEquity()

  const answers = {
    ...businessBriefing,
    partner_count: partners.length,
  }

  const currentQ = QUESTIONS.findIndex(q => !answers[q.key] && answers[q.key] !== 0)
  const activeIdx = currentQ === -1 ? QUESTIONS.length - 1 : currentQ
  const activeQ = QUESTIONS[activeIdx]
  const allAnswered = QUESTIONS.every(q => answers[q.key])

  function answer(key, value) {
    if (key === 'partner_count') {
      setPartnerCount(value)
      return
    }
    updateBriefing(key, value)
    if (key === 'founders_type') {
      const weights = FOUNDERS_TYPE_WEIGHTS[value]
      if (weights) setSuggestedWeights(weights)
    }
  }

  return (
    <div>
      {/* Progresso das perguntas */}
      <div className="flex gap-1 mb-8">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < activeIdx ? 'bg-primary' : i === activeIdx ? 'bg-primary/50' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-3">
          Pergunta {activeIdx + 1} de {QUESTIONS.length}
        </p>
        <h2 className="font-heading text-xl font-bold text-bg-dark mb-1">{activeQ.label}</h2>
        {activeQ.hint && (
          <p className="font-body text-sm text-gray-400 mb-5">{activeQ.hint}</p>
        )}
        {!activeQ.hint && <div className="mb-5" />}

        {/* Cards */}
        {activeQ.type === 'cards' && (
          <div className="flex flex-col gap-2">
            {activeQ.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => answer(activeQ.key, opt.value)}
                className={`text-left px-4 py-3 rounded-xl border font-body text-sm transition-all ${
                  answers[activeQ.key] === opt.value
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-primary/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Select */}
        {activeQ.type === 'select' && (
          <select
            value={answers[activeQ.key] || ''}
            onChange={e => answer(activeQ.key, e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          >
            <option value="">Selecione...</option>
            {activeQ.options.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        {/* Count */}
        {activeQ.type === 'count' && (
          <div className="flex gap-3">
            {activeQ.options.map(n => (
              <button
                key={n}
                onClick={() => answer(activeQ.key, n)}
                className={`w-12 h-12 rounded-xl border font-cta text-sm font-bold transition-all ${
                  answers[activeQ.key] === n
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 text-gray-700 hover:border-primary/40'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notificação pesos calibrados */}
      {businessBriefing.founders_type && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-body text-xs text-blue-700">
            Pesos sugeridos atualizados com base no perfil dos sócios.
          </p>
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        onClick={() => goToStep('PARTNERS_SETUP')}
        disabled={!allAnswered}
        className="w-full"
      >
        Continuar para sócios →
      </Button>
    </div>
  )
}
