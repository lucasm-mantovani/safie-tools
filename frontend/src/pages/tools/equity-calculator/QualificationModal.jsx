import { useState } from 'react'
import { useEquity } from './EquityContext'
import { api } from '../../../services/api'

const QUESTIONS = [
  {
    key: 'already_has_lawyer',
    label: 'A empresa já tem advogado societário?',
    options: [
      { value: 'yes',      label: 'Sim, temos' },
      { value: 'no',       label: 'Ainda não' },
      { value: 'looking',  label: 'Estamos procurando' },
    ],
  },
  {
    key: 'urgency',
    label: 'Qual é a urgência para formalizar o acordo de sócios?',
    options: [
      { value: 'asap',      label: 'Imediata — precisamos agora' },
      { value: 'months',    label: 'Próximos 3 meses' },
      { value: 'no_rush',   label: 'Sem pressa' },
    ],
  },
  {
    key: 'main_concern',
    label: 'Qual é a principal preocupação na divisão?',
    options: [
      { value: 'fairness',     label: 'Garantir que seja justa' },
      { value: 'legal',        label: 'Proteção jurídica' },
      { value: 'future',       label: 'Prever saída de sócios' },
      { value: 'investment',   label: 'Preparar para investidores' },
    ],
  },
  {
    key: 'contact_preference',
    label: 'Se a SAFIE puder ajudar, como prefere ser contatado?',
    options: [
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'email',    label: 'E-mail' },
      { value: 'call',     label: 'Ligação' },
      { value: 'none',     label: 'Prefiro não ser contatado' },
    ],
  },
]

export default function QualificationModal() {
  const { businessBriefing, partners, dimensionWeights, evaluations, setQualificationData, setResults, goToStep } = useEquity()
  const [answers, setAnswers] = useState({})
  const [activeIdx, setActiveIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const activeQ = QUESTIONS[activeIdx]
  const allAnswered = QUESTIONS.every(q => answers[q.key])

  function answer(key, value) {
    const next = { ...answers, [key]: value }
    setAnswers(next)
    if (activeIdx < QUESTIONS.length - 1) {
      setTimeout(() => setActiveIdx(i => i + 1), 300)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const evalArray = partners.map((_, i) => ({
        partner_index: i,
        ...evaluations[i],
      }))

      const payload = {
        business_briefing: businessBriefing,
        partners: partners.map(p => ({ name: p.name, color: p.color })),
        dimension_weights: dimensionWeights,
        evaluations: evalArray,
        qualification_data: answers,
      }

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 10000)
      )
      const { data } = await Promise.race([
        api.post('/tools/equity-calculator/session', payload),
        timeout,
      ])
      setQualificationData(answers)
      setResults(data, data.session_id)
    } catch (err) {
      if (err.message === 'TIMEOUT') {
        setError('Não foi possível carregar. Verifique sua conexão e tente novamente.')
      } else {
        setError(err.response?.data?.message || err.message)
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        {/* Progresso */}
        <div className="flex gap-1.5 mb-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < activeIdx ? 'bg-primary' : i === activeIdx ? 'bg-primary/50' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">
          {activeIdx + 1} de {QUESTIONS.length}
        </p>
        <h2 className="font-heading text-xl font-bold text-bg-dark mb-6">
          {activeQ.label}
        </h2>

        <div className="flex flex-col gap-2 mb-8">
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="font-body text-sm text-red-600">{error}</p>
          </div>
        )}

        {allAnswered && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark disabled:opacity-50 transition-colors px-5 py-3 rounded-xl"
          >
            {submitting ? 'Calculando participações...' : 'Ver meu resultado →'}
          </button>
        )}
      </div>
    </div>
  )
}
