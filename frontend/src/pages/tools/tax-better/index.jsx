import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import Button from '../../../components/ui/Button'
import { generatePdfFromData } from '../../../utils/pdfGenerator'

// ── Opções ────────────────────────────────────────────────────────────────────

const REVENUE_OPTIONS = [
  { value: 'ate_81k',    label: 'Até R$81 mil/ano' },
  { value: '81k_360k',  label: 'R$81 mil a R$360 mil/ano' },
  { value: '360k_1M',   label: 'R$360 mil a R$1 milhão/ano' },
  { value: '1M_4_8M',   label: 'R$1 milhão a R$4,8 milhões/ano' },
  { value: '4_8M_78M',  label: 'R$4,8 milhões a R$78 milhões/ano' },
  { value: 'acima_78M', label: 'Acima de R$78 milhões/ano' },
]

const REGIME_OPTIONS = [
  { value: 'mei',              label: 'MEI' },
  { value: 'simples',          label: 'Simples Nacional' },
  { value: 'lucro_presumido',  label: 'Lucro Presumido' },
  { value: 'lucro_real',       label: 'Lucro Real' },
  { value: 'nao_sei',          label: 'Não sei informar' },
]

const ACTIVITY_OPTIONS = [
  { value: 'servicos', label: 'Prestação de serviços' },
  { value: 'produtos', label: 'Venda de produtos' },
  { value: 'misto',    label: 'Serviços e produtos' },
]

const MARGIN_OPTIONS = [
  { value: 'ate_10',    label: 'Até 10%' },
  { value: '10_a_20',   label: 'De 10% a 20%' },
  { value: '20_a_30',   label: 'De 20% a 30%' },
  { value: 'acima_30',  label: 'Acima de 30%' },
]

const REVIEWED_OPTIONS = [
  { value: 'menos_1_ano',  label: 'Há menos de 1 ano' },
  { value: '1_a_2_anos',   label: 'Entre 1 e 2 anos atrás' },
  { value: 'mais_2_anos',  label: 'Há mais de 2 anos' },
  { value: 'nunca',        label: 'Nunca foi revisado' },
]

const STATUS_CONFIG = {
  otimizado: {
    label: 'Regime Otimizado',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  atencao: {
    label: 'Atenção',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: (
      <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  revisao_urgente: {
    label: 'Revisão Urgente',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: (
      <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function TaxBetter() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    annual_revenue_range: '',
    current_regime: '',
    activity_type: '',
    profit_margin: '',
    last_reviewed: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const step1Valid = form.annual_revenue_range && form.current_regime && form.activity_type
  const step2Valid = form.profit_margin && form.last_reviewed

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/tools/tax-better', form)
      setResult(data)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleExportPDF() {
    if (!result) return
    const r = result.result
    generatePdfFromData({
      title: 'Tax Better — Diagnóstico de Regime Tributário',
      sections: [
        { label: 'Diagnóstico', value: STATUS_CONFIG[r.status]?.label || r.status },
        { label: 'Regime atual', value: r.current_regime_label },
        { label: 'Regime recomendado', value: r.recommended_regime_label },
        { label: 'Economia potencial estimada', value: r.savings_estimate_pct > 0 ? `Até ${r.savings_estimate_pct}%` : 'Regime já otimizado' },
        { label: 'Análise', value: r.reasoning },
        { label: 'Próximo passo', value: r.cta },
        { label: 'Faturamento anual', value: REVENUE_OPTIONS.find(o => o.value === form.annual_revenue_range)?.label || '' },
        { label: 'Tipo de atividade', value: ACTIVITY_OPTIONS.find(o => o.value === form.activity_type)?.label || '' },
        { label: 'Margem de lucro', value: MARGIN_OPTIONS.find(o => o.value === form.profit_margin)?.label || '' },
        { label: 'Última revisão tributária', value: REVIEWED_OPTIONS.find(o => o.value === form.last_reviewed)?.label || '' },
      ],
      fileName: 'tax-better-safie',
    })
  }

  function handleReset() {
    setForm({ annual_revenue_range: '', current_regime: '', activity_type: '', profit_margin: '', last_reviewed: '' })
    setResult(null)
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-safie-light">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/dashboard')}
            className="flex items-center gap-1.5 font-cta text-sm text-gray-400 hover:text-primary transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {step > 1 && step < 3 ? 'Voltar' : 'Dashboard'}
          </button>

          <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Ferramenta 2 de 6
          </p>
          <h1 className="font-heading text-3xl font-bold text-bg-dark mb-2">Tax Better</h1>
          <p className="font-body text-sm text-gray-500">
            Descubra se sua empresa está no regime tributário mais vantajoso.
          </p>
        </div>

        {step < 3 && <StepIndicator current={step} />}

        {step === 1 && (
          <Step1
            form={form}
            set={set}
            onNext={() => setStep(2)}
            canAdvance={step1Valid}
          />
        )}

        {step === 2 && (
          <Step2
            form={form}
            set={set}
            onSubmit={handleSubmit}
            canAdvance={step2Valid}
            loading={loading}
            error={error}
          />
        )}

        {step === 3 && result && (
          <Results
            result={result.result}
            form={form}
            onExportPDF={handleExportPDF}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}

// ── Step Indicator ─────────────────────────────────────────────────────────────

function StepIndicator({ current }) {
  const steps = ['Sobre a empresa', 'Detalhes financeiros']
  return (
    <div className="flex items-center gap-3 mb-8">
      {steps.map((label, i) => {
        const n = i + 1
        const active = n === current
        const done = n < current
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
              ${done || active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              {done ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : n}
            </div>
            <span className={`font-cta text-xs font-medium ${active ? 'text-bg-dark' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200 ml-1" />}
          </div>
        )
      })}
    </div>
  )
}

// ── Passo 1 ────────────────────────────────────────────────────────────────────

function Step1({ form, set, onNext, canAdvance }) {
  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-heading text-lg font-bold text-bg-dark mb-6">Sobre a empresa</h2>

        <div className="flex flex-col gap-6">
          <SelectField
            label="Faturamento anual (bruto)"
            value={form.annual_revenue_range}
            onChange={(v) => set('annual_revenue_range', v)}
            options={REVENUE_OPTIONS}
            placeholder="Selecione a faixa..."
          />
          <SelectField
            label="Regime tributário atual"
            value={form.current_regime}
            onChange={(v) => set('current_regime', v)}
            options={REGIME_OPTIONS}
            placeholder="Selecione o regime..."
          />
          <SelectField
            label="Tipo de atividade principal"
            value={form.activity_type}
            onChange={(v) => set('activity_type', v)}
            options={ACTIVITY_OPTIONS}
            placeholder="Selecione o tipo..."
          />
        </div>
      </div>

      <Button variant="primary" size="md" onClick={onNext} disabled={!canAdvance} className="w-full">
        Continuar →
      </Button>
    </div>
  )
}

// ── Passo 2 ────────────────────────────────────────────────────────────────────

function Step2({ form, set, onSubmit, canAdvance, loading, error }) {
  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-heading text-lg font-bold text-bg-dark mb-6">Detalhes financeiros</h2>

        <div className="flex flex-col gap-6">
          <SelectField
            label="Margem de lucro estimada"
            hint="Lucro líquido ÷ faturamento bruto"
            value={form.profit_margin}
            onChange={(v) => set('profit_margin', v)}
            options={MARGIN_OPTIONS}
            placeholder="Selecione a margem..."
          />
          <SelectField
            label="Última revisão tributária"
            hint="Quando um contador avaliou se seu regime é o ideal"
            value={form.last_reviewed}
            onChange={(v) => set('last_reviewed', v)}
            options={REVIEWED_OPTIONS}
            placeholder="Selecione..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="font-body text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button variant="primary" size="md" onClick={onSubmit} disabled={!canAdvance || loading} className="w-full">
        {loading ? 'Analisando...' : 'Ver diagnóstico →'}
      </Button>
    </div>
  )
}

// ── Resultado ──────────────────────────────────────────────────────────────────

function Results({ result, form, onExportPDF, onReset }) {
  const config = STATUS_CONFIG[result.status] || STATUS_CONFIG.atencao
  const isOptimal = result.status === 'otimizado'

  return (
    <div>
      {/* Semáforo principal */}
      <div className={`rounded-2xl border p-6 mb-6 ${config.bg} ${config.border}`}>
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-0.5">{config.icon}</div>
          <div className="flex-1">
            <p className={`font-cta text-xs font-bold uppercase tracking-widest mb-1 ${config.color}`}>
              {config.label}
            </p>
            <p className="font-heading text-xl font-bold text-bg-dark mb-3">
              {isOptimal
                ? `Regime ${result.recommended_regime_label} — você está bem`
                : `Regime recomendado: ${result.recommended_regime_label}`}
            </p>
            <p className="font-body text-sm text-gray-600 leading-relaxed">{result.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Detalhes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-bg-dark">Resumo do diagnóstico</h2>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 font-cta text-xs font-semibold text-primary hover:text-secondary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Exportar PDF
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <InfoCard label="Regime atual" value={result.current_regime_label} />
          <InfoCard label="Regime ideal" value={result.recommended_regime_label} highlight={!isOptimal} />
          <InfoCard
            label="Economia potencial"
            value={result.savings_estimate_pct > 0 ? `Até ${result.savings_estimate_pct}%` : 'Regime otimizado'}
            highlight={result.savings_estimate_pct > 0}
          />
          <InfoCard
            label="Última revisão"
            value={REVIEWED_OPTIONS.find(o => o.value === form.last_reviewed)?.label || ''}
          />
        </div>

        {/* Semáforo visual */}
        <div className="flex items-center gap-3 py-4 border-t border-gray-100">
          {['otimizado', 'atencao', 'revisao_urgente'].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full transition-all ${
                result.status === s ? STATUS_CONFIG[s].dot + ' scale-125' : 'bg-gray-200'
              }`} />
              <span className={`font-cta text-xs ${result.status === s ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>
                {STATUS_CONFIG[s].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA SAFIE */}
      <div className="bg-bg-dark rounded-2xl p-6 mb-6 text-white">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Próximo passo</p>
        <h3 className="font-heading text-lg font-bold mb-2">
          {isOptimal ? 'Mantenha seu regime sempre revisado' : 'Reduza sua carga tributária agora'}
        </h3>
        <p className="font-body text-sm text-gray-400 leading-relaxed mb-5">{result.cta}</p>
        <a
          href="https://safie.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary transition-colors px-5 py-2.5 rounded-lg"
        >
          Falar com a SAFIE
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      <button onClick={onReset} className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2">
        Fazer novo diagnóstico
      </button>
    </div>
  )
}

// ── Componentes auxiliares ─────────────────────────────────────────────────────

function SelectField({ label, hint, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700 block mb-1">{label}</label>
      {hint && <p className="font-body text-xs text-gray-400 mb-1.5">{hint}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function InfoCard({ label, value, highlight = false }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="font-cta text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-body text-sm font-semibold leading-snug ${highlight ? 'text-primary' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  )
}
