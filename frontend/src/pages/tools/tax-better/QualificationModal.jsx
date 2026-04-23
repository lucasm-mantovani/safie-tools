import { useState } from 'react'
import { useTax } from './TaxContext'
import { api } from '../../../services/api'

const QUESTIONS = [
  {
    key: 'has_accountant',
    label: 'Sua empresa tem contador dedicado?',
    options: [
      { value: 'yes', label: 'Sim, temos contador' },
      { value: 'no', label: 'Não temos' },
      { value: 'looking', label: 'Estamos buscando' },
    ],
  },
  {
    key: 'urgency',
    label: 'Qual é a urgência para revisar o regime tributário?',
    options: [
      { value: 'asap', label: 'Imediata — preciso agora' },
      { value: 'months', label: 'Nos próximos 3 meses' },
      { value: 'no_rush', label: 'Sem pressa, só estou explorando' },
    ],
  },
  {
    key: 'main_concern',
    label: 'Qual é a principal preocupação tributária?',
    options: [
      { value: 'reduce_taxes', label: 'Reduzir a carga tributária' },
      { value: 'compliance', label: 'Estar em conformidade fiscal' },
      { value: 'growth', label: 'Planejar o crescimento' },
      { value: 'understand', label: 'Entender melhor o regime atual' },
    ],
  },
  {
    key: 'contact_preference',
    label: 'Se a SAFIE puder ajudar, como prefere ser contatado?',
    options: [
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'email', label: 'E-mail' },
      { value: 'call', label: 'Ligação' },
      { value: 'none', label: 'Prefiro não ser contatado' },
    ],
  },
]

function parseBRL(str) {
  return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0
}

export default function QualificationModal() {
  const {
    companyProfile,
    revenueData,
    costStructure,
    partnerRemuneration,
    supplementaryData,
    setQualificationData,
    setResults,
    goToStep,
  } = useTax()

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
      const { partners, partners_count } = partnerRemuneration
      const payload = {
        company_profile: companyProfile,
        revenue_data: {
          monthly_revenue: parseBRL(revenueData.monthly_revenue),
          services_revenue_pct: revenueData.services_revenue_pct,
          products_revenue_pct: revenueData.products_revenue_pct,
          has_seasonal_revenue: revenueData.has_seasonal_revenue,
          has_export_revenue: revenueData.has_export_revenue,
          has_financial_revenue: revenueData.has_financial_revenue,
        },
        cost_structure: {
          payroll: parseBRL(costStructure.payroll),
          documented_supplier_costs: parseBRL(costStructure.documented_supplier_costs),
          rent: parseBRL(costStructure.rent),
          equipment_depreciation: parseBRL(costStructure.equipment_depreciation),
          other_documented_costs: parseBRL(costStructure.other_documented_costs),
          rd_investment: parseBRL(costStructure.rd_investment),
        },
        partner_remuneration: {
          partners_count,
          total_prolabore: partners.reduce((s, p) => s + parseBRL(p.prolabore), 0),
          total_profit_distribution: partners.reduce((s, p) => s + parseBRL(p.profit_distribution), 0),
          partners: partners.map(p => ({
            prolabore: parseBRL(p.prolabore),
            profit_distribution: parseBRL(p.profit_distribution),
          })),
        },
        supplementary_data: {
          ...supplementaryData,
          iss_rate: supplementaryData.iss_rate
            ? parseFloat(String(supplementaryData.iss_rate).replace(',', '.'))
            : null,
        },
        qualification_data: answers,
      }

      const { data } = await api.post('/tools/tax-diagnostic/session', payload)
      setQualificationData(answers)
      setResults(data.result, data.session_id)
    } catch (err) {
      setError(err.message || 'Erro ao processar diagnóstico. Tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
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

        {allAnswered && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark disabled:opacity-50 transition-colors px-5 py-3 rounded-xl"
          >
            {submitting ? 'Calculando diagnóstico...' : 'Ver meu diagnóstico →'}
          </button>
        )}

        <button
          onClick={() => goToStep('SUPPLEMENTARY')}
          className="w-full mt-3 font-cta text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
