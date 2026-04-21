import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { api } from '../../services/api'
import Button from '../../components/ui/Button'
import Slider from '../../components/ui/Slider'
import { generatePdfFromData } from '../../utils/pdfGenerator'

// ── Constantes ────────────────────────────────────────────────────────────────

const CRITERIA = [
  { key: 'financial',  label: 'Aporte Financeiro',     desc: 'Capital investido ou comprometido' },
  { key: 'dedication', label: 'Dedicação',              desc: 'Tempo e esforço no dia a dia' },
  { key: 'technical',  label: 'Conhecimento Técnico',   desc: 'Expertise relevante para o negócio' },
  { key: 'commercial', label: 'Capacidade Comercial',   desc: 'Habilidade de gerar receita' },
  { key: 'network',    label: 'Rede de Contatos',       desc: 'Relacionamentos estratégicos' },
]

const COMPANY_STATUS_OPTIONS = [
  { value: 'pre_operacional', label: 'Pré-operacional (ideia/MVP)' },
  { value: 'operacional',     label: 'Operacional (sem faturamento)' },
  { value: 'faturando',       label: 'Faturando' },
]

const AGREEMENT_OPTIONS = [
  { value: 'sim',           label: 'Sim, temos acordo de sócios' },
  { value: 'em_elaboracao', label: 'Em elaboração' },
  { value: 'nao',           label: 'Não temos' },
]

const SEGMENT_OPTIONS = [
  'SaaS B2B', 'SaaS B2C', 'Marketplace', 'E-commerce', 'Fintech',
  'Healthtech', 'Edtech', 'Agtech', 'Legaltech', 'Consultoria Digital',
  'Desenvolvimento de Software', 'Outro',
]

const CHART_COLORS = ['#154efa', '#0f0f29', '#6b8fff', '#94a3b8', '#cbd5e1', '#e2e8f0']

function makePartner(id) {
  return { id, name: '', financial: 50, dedication: 50, technical: 50, commercial: 50, network: 50 }
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function EquityCalculator() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [partners, setPartners] = useState([makePartner(1), makePartner(2)])
  const [context, setContext] = useState({
    company_status: '',
    has_shareholders_agreement: '',
    business_segment: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── Sócios ─────────────────────────────────────────────────────────────────

  function addPartner() {
    if (partners.length >= 10) return
    setPartners((prev) => [...prev, makePartner(Date.now())])
  }

  function removePartner(id) {
    if (partners.length <= 2) return
    setPartners((prev) => prev.filter((p) => p.id !== id))
  }

  function updatePartner(id, field, value) {
    setPartners((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p))
  }

  function canAdvanceStep1() {
    return partners.every((p) => p.name.trim().length >= 2)
  }

  function canAdvanceStep2() {
    return context.company_status && context.has_shareholders_agreement && context.business_segment
  }

  // ── Submissão ──────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        partners: partners.map(({ name, financial, dedication, technical, commercial, network }) => ({
          name, financial, dedication, technical, commercial, network,
        })),
        ...context,
      }
      const { data } = await api.post('/tools/equity-calculator', payload)
      setResult(data)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── PDF ────────────────────────────────────────────────────────────────────

  function handleExportPDF() {
    if (!result) return
    const sections = [
      ...result.result.partners.map((p) => ({
        label: p.name,
        value: `${p.percentage.toFixed(2)}%`,
      })),
      { label: 'Status da empresa', value: COMPANY_STATUS_OPTIONS.find(o => o.value === context.company_status)?.label || context.company_status },
      { label: 'Acordo de sócios', value: AGREEMENT_OPTIONS.find(o => o.value === context.has_shareholders_agreement)?.label || context.has_shareholders_agreement },
      { label: 'Segmento', value: context.business_segment },
    ]
    generatePdfFromData({
      title: 'Equity Calculator',
      sections,
      fileName: 'equity-safie-tools',
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-safie-light">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/dashboard')}
            className="flex items-center gap-1.5 font-cta text-sm text-gray-400 hover:text-primary transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {step > 1 ? 'Voltar' : 'Dashboard'}
          </button>

          <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Ferramenta 1 de 6
          </p>
          <h1 className="font-heading text-3xl font-bold text-bg-dark mb-2">
            Equity Calculator
          </h1>
          <p className="font-body text-sm text-gray-500">
            Simule a distribuição justa de cotas entre sócios com critérios objetivos.
          </p>
        </div>

        {/* Step indicator */}
        {step < 3 && <StepIndicator current={step} />}

        {/* Steps */}
        {step === 1 && (
          <Step1Partners
            partners={partners}
            onAdd={addPartner}
            onRemove={removePartner}
            onUpdate={updatePartner}
            onNext={() => setStep(2)}
            canAdvance={canAdvanceStep1()}
          />
        )}

        {step === 2 && (
          <Step2Context
            context={context}
            onChange={(field, value) => setContext(prev => ({ ...prev, [field]: value }))}
            onNext={handleSubmit}
            canAdvance={canAdvanceStep2()}
            loading={loading}
            error={error}
          />
        )}

        {step === 3 && result && (
          <Results
            result={result}
            partners={partners}
            context={context}
            onExportPDF={handleExportPDF}
            onReset={() => { setStep(1); setPartners([makePartner(1), makePartner(2)]); setContext({ company_status: '', has_shareholders_agreement: '', business_segment: '' }); setResult(null) }}
          />
        )}
      </div>
    </div>
  )
}

// ── Step Indicator ─────────────────────────────────────────────────────────────

function StepIndicator({ current }) {
  const steps = ['Sócios e critérios', 'Contexto da empresa']
  return (
    <div className="flex items-center gap-3 mb-8">
      {steps.map((label, i) => {
        const n = i + 1
        const active = n === current
        const done = n < current
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
              ${done ? 'bg-primary text-white' : active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
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

// ── Passo 1: Sócios ────────────────────────────────────────────────────────────

function Step1Partners({ partners, onAdd, onRemove, onUpdate, onNext, canAdvance }) {
  const [activePartner, setActivePartner] = useState(partners[0]?.id)

  return (
    <div>
      {/* Lista de sócios */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-bg-dark">Sócios</h2>
          {partners.length < 10 && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 font-cta text-sm font-semibold text-primary hover:text-secondary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar sócio
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {partners.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActivePartner(p.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border font-cta text-sm transition-all
                ${activePartner === p.id
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-primary/20'}`}
            >
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {i + 1}
              </span>
              {p.name || `Sócio ${i + 1}`}
              {partners.length > 2 && (
                <span
                  onClick={(e) => { e.stopPropagation(); onRemove(p.id) }}
                  className="ml-0.5 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Formulário do sócio ativo */}
        {partners.map((p) => p.id === activePartner ? (
          <div key={p.id}>
            <div className="mb-6">
              <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">
                Nome do sócio
              </label>
              <input
                type="text"
                value={p.name}
                onChange={(e) => onUpdate(p.id, 'name', e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <p className="font-cta text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Critérios de avaliação
            </p>

            <div className="flex flex-col gap-5">
              {CRITERIA.map((c) => (
                <div key={c.key}>
                  <Slider
                    label={c.label}
                    name={`${p.id}-${c.key}`}
                    value={p[c.key]}
                    onChange={(val) => onUpdate(p.id, c.key, val)}
                  />
                  <p className="font-body text-xs text-gray-400 mt-1">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null)}
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={onNext}
        disabled={!canAdvance}
        className="w-full"
      >
        Continuar para contexto da empresa →
      </Button>

      {!canAdvance && (
        <p className="font-body text-xs text-gray-400 text-center mt-3">
          Preencha o nome de todos os sócios para continuar.
        </p>
      )}
    </div>
  )
}

// ── Passo 2: Contexto ──────────────────────────────────────────────────────────

function Step2Context({ context, onChange, onNext, canAdvance, loading, error }) {
  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-heading text-lg font-bold text-bg-dark mb-6">Contexto da empresa</h2>

        <div className="flex flex-col gap-6">
          <div>
            <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">
              Status atual da empresa
            </label>
            <select
              value={context.company_status}
              onChange={(e) => onChange('company_status', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
            >
              <option value="">Selecione...</option>
              {COMPANY_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">
              Acordo de sócios
            </label>
            <select
              value={context.has_shareholders_agreement}
              onChange={(e) => onChange('has_shareholders_agreement', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
            >
              <option value="">Selecione...</option>
              {AGREEMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">
              Segmento do negócio
            </label>
            <select
              value={context.business_segment}
              onChange={(e) => onChange('business_segment', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
            >
              <option value="">Selecione...</option>
              {SEGMENT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="font-body text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        onClick={onNext}
        disabled={!canAdvance || loading}
        className="w-full"
      >
        {loading ? 'Calculando...' : 'Ver resultado →'}
      </Button>
    </div>
  )
}

// ── Resultado ──────────────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  )
}

function Results({ result, partners, context, onExportPDF, onReset }) {
  const chartData = result.result.partners.map((p, i) => ({
    name: p.name,
    value: p.percentage,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const needsAgreement = result.qualification_data.equity_sql_tag

  const agreementLabel = AGREEMENT_OPTIONS.find(o => o.value === context.has_shareholders_agreement)?.label
  const statusLabel = COMPANY_STATUS_OPTIONS.find(o => o.value === context.company_status)?.label

  return (
    <div>
      {/* Banner de alerta — falta acordo de sócios */}
      {needsAgreement && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 flex gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="font-cta text-sm font-semibold text-amber-800 mb-0.5">Você não tem acordo de sócios</p>
            <p className="font-body text-xs text-amber-700 leading-relaxed">
              Sem um acordo de sócios, essa divisão não tem validade jurídica. A SAFIE pode te ajudar a estruturar um.
            </p>
          </div>
        </div>
      )}

      {/* Gráfico + tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-bold text-bg-dark">Resultado da simulação</h2>
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

        {/* Gráfico de pizza */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                labelLine={false}
                label={CustomLabel}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value.toFixed(2)}%`, 'Participação']}
                contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Legend
                formatter={(value) => <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#374151' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de resultados */}
        <div className="divide-y divide-gray-50">
          {result.result.partners.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="font-body text-sm font-medium text-gray-800">{p.name}</span>
              </div>
              <span className="font-cta text-base font-bold text-primary">
                {p.percentage.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        {/* Contexto */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ContextChip label="Status" value={statusLabel} />
          <ContextChip label="Acordo" value={agreementLabel} />
          <ContextChip label="Segmento" value={context.business_segment} />
        </div>
      </div>

      {/* CTA SAFIE */}
      <div className="bg-bg-dark rounded-2xl p-6 mb-6 text-white">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Próximo passo</p>
        <h3 className="font-heading text-lg font-bold mb-2">Formalize essa divisão com segurança jurídica</h3>
        <p className="font-body text-sm text-gray-400 leading-relaxed mb-5">
          Uma simulação é o primeiro passo. A SAFIE pode ajudar você a estruturar um acordo de sócios robusto, com cláusulas de vesting, tag-along e drag-along.
        </p>
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

      <button
        onClick={onReset}
        className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2"
      >
        Fazer nova simulação
      </button>
    </div>
  )
}

function ContextChip({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="font-cta text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="font-body text-xs font-medium text-gray-700 leading-snug">{value}</p>
    </div>
  )
}
