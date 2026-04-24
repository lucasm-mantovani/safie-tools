import { useState } from 'react'
import { useDD } from './DDContext'
import { api } from '../../../services/api'

const QUESTIONS = [
  {
    key: 'has_legal_advisor',
    label: 'Você já tem um assessor jurídico acompanhando essa operação?',
    options: [
      { value: 'sim_especializado', label: 'Sim, especializado em M&A/Captação' },
      { value: 'sim_nao_especializado', label: 'Sim, mas não especializado nessa área' },
      { value: 'nao', label: 'Não tenho assessor' },
      { value: 'buscando', label: 'Estou buscando' },
    ],
  },
  {
    key: 'timeline_preference',
    label: 'Qual é o seu timeline para iniciar o processo?',
    options: [
      { value: 'ate_3_meses', label: 'Nos próximos 3 meses' },
      { value: '3_a_6_meses', label: 'Entre 3 e 6 meses' },
      { value: '6_a_12_meses', label: 'Entre 6 e 12 meses' },
      { value: 'explorando', label: 'Ainda explorando, sem data definida' },
    ],
  },
  {
    key: 'preliminary_conversations',
    label: 'Já houve conversas preliminares com investidores ou compradores?',
    options: [
      { value: 'sim_com_termo', label: 'Sim, com termo de interesse (LOI/MOU)' },
      { value: 'sim_conversas', label: 'Sim, conversas iniciais apenas' },
      { value: 'nao', label: 'Ainda não iniciamos conversas' },
    ],
  },
  {
    key: 'main_objective',
    label: 'Qual é o principal objetivo com esse diagnóstico?',
    options: [
      { value: 'identificar_problemas', label: 'Identificar o que precisa ser corrigido' },
      { value: 'confirmar_prontidao', label: 'Confirmar que estou pronto para iniciar' },
      { value: 'entender_timeline', label: 'Entender quanto tempo de preparação preciso' },
      { value: 'apresentar_time', label: 'Apresentar para meu time ou sócios' },
    ],
  },
  {
    key: 'preparation_team_size',
    label: 'Quantas pessoas estão envolvidas na preparação da empresa para esse processo?',
    options: [
      { value: 'so_eu', label: 'Só eu' },
      { value: 'eu_cofundador', label: 'Eu e um co-fundador' },
      { value: 'time_interno', label: 'Time interno de 3 ou mais pessoas' },
      { value: 'assessores_externos', label: 'Já temos assessores externos envolvidos' },
    ],
  },
]

export default function QualificationModal() {
  const {
    operationType,
    companySnapshot,
    checklistResponses,
    qualificationData: savedQual,
    setQualificationData,
    setResults,
    goToStep,
  } = useDD()

  const [answers, setAnswers] = useState(savedQual || {})
  const [activeIdx, setActiveIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const activeQ = QUESTIONS[activeIdx]
  const allAnswered = QUESTIONS.every(q => answers[q.key])

  function answer(key, value) {
    const next = { ...answers, [key]: value }
    setAnswers(next)
    if (activeIdx < QUESTIONS.length - 1) {
      setTimeout(() => setActiveIdx(i => i + 1), 280)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setLoading(true)
    setError(null)
    try {
      const responses = Object.entries(checklistResponses).map(([id, r]) => ({
        id,
        status: r.status,
        ...(r.founder_description ? { founder_description: r.founder_description } : {}),
      }))

      const payload = {
        operation_type: operationType,
        company_snapshot: {
          company_name: companySnapshot.company_name,
          ...(companySnapshot.founding_year ? { founding_year: Number(companySnapshot.founding_year) } : {}),
          ...(companySnapshot.business_segment ? { business_segment: companySnapshot.business_segment } : {}),
          ...(companySnapshot.current_stage ? { current_stage: companySnapshot.current_stage } : {}),
          ...(companySnapshot.monthly_revenue_range ? { monthly_revenue_range: companySnapshot.monthly_revenue_range } : {}),
          ...(companySnapshot.employees_count_range ? { employees_count_range: companySnapshot.employees_count_range } : {}),
          ...(companySnapshot.has_previous_funding !== null ? { has_previous_funding: companySnapshot.has_previous_funding } : {}),
          ...(companySnapshot.has_legal_advisor ? { has_legal_advisor: companySnapshot.has_legal_advisor } : {}),
        },
        checklist_responses: responses,
        qualification_data: answers,
      }

      await new Promise(r => setTimeout(r, 3000))

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 35000)
      )
      const request = api.post('/tools/due-diligence/session', payload)
      const { data } = await Promise.race([request, timeout])

      setQualificationData(answers)
      setResults(data.result, data.session_id)
    } catch (err) {
      if (err.message === 'TIMEOUT') {
        setError('Não foi possível gerar seu diagnóstico. Verifique sua conexão e tente novamente.')
      } else {
        setError(err.response?.data?.message || err.message || 'Erro ao processar diagnóstico.')
      }
      setSubmitting(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold text-bg-dark mb-2">Gerando seu diagnóstico</h2>
          <p className="font-body text-sm text-gray-500">Analisando suas respostas e identificando red flags...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <p className="font-body text-sm text-gray-500 mb-4">
          Antes de mostrar seu diagnóstico, algumas perguntas rápidas:
        </p>

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
        <h2 className="font-heading text-xl font-bold text-bg-dark mb-6">{activeQ.label}</h2>

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

        {allAnswered && !submitting && (
          <button
            onClick={handleSubmit}
            className="w-full font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark transition-colors px-5 py-3 rounded-xl"
          >
            Ver meu diagnóstico →
          </button>
        )}

        <button
          onClick={() => goToStep('CHECKLIST')}
          className="w-full mt-3 font-cta text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          Voltar ao checklist
        </button>
      </div>
    </div>
  )
}
