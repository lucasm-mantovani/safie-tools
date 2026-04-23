import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import Button from '../../../components/ui/Button'
import { generatePdfFromData } from '../../../utils/pdfGenerator'

// ── Fatores de risco ──────────────────────────────────────────────────────────

const FACTORS = [
  {
    key: 'exclusivity',
    label: 'Exclusividade',
    desc: 'O prestador trabalha exclusivamente para sua empresa?',
  },
  {
    key: 'subordination',
    label: 'Subordinação hierárquica',
    desc: 'Ele segue ordens diretas de gestores internos?',
  },
  {
    key: 'regularity',
    label: 'Habitualidade',
    desc: 'Presta serviços de forma contínua e regular?',
  },
  {
    key: 'time_control',
    label: 'Controle de horário',
    desc: 'Há horário fixo ou controle de jornada?',
  },
  {
    key: 'equipment_provided',
    label: 'Fornecimento de equipamentos',
    desc: 'Sua empresa fornece ferramentas, computador ou equipamentos?',
  },
]

const RISK_CONFIG = {
  alto: {
    label: 'Alto Risco',
    short: 'Alto',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
  medio: {
    label: 'Risco Médio',
    short: 'Médio',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  baixo: {
    label: 'Baixo Risco',
    short: 'Baixo',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
}

const EXPOSURE_MESSAGES = {
  alto: 'Sua empresa tem exposição trabalhista significativa. Ação imediata é recomendada.',
  medio: 'Existem pontos de atenção. Uma revisão preventiva dos contratos é aconselhável.',
  baixo: 'Exposição sob controle. Continue monitorando as condições dos contratos periodicamente.',
}

function makeContractor(id) {
  return {
    id,
    name: '',
    exclusivity: false,
    subordination: false,
    regularity: false,
    time_control: false,
    equipment_provided: false,
  }
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function LaborRisk() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [contractors, setContractors] = useState([makeContractor(1)])
  const [hasHadLawsuit, setHasHadLawsuit] = useState(null)
  const [activeId, setActiveId] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function addContractor() {
    if (contractors.length >= 10) return
    const id = Date.now()
    setContractors((prev) => [...prev, makeContractor(id)])
    setActiveId(id)
  }

  function removeContractor(id) {
    if (contractors.length <= 1) return
    const remaining = contractors.filter((c) => c.id !== id)
    setContractors(remaining)
    if (activeId === id) setActiveId(remaining[0].id)
  }

  function updateContractor(id, field, value) {
    setContractors((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c))
  }

  const step1Valid = contractors.every((c) => c.name.trim().length >= 2) && hasHadLawsuit !== null
  const active = contractors.find((c) => c.id === activeId)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        contractors: contractors.map(({ name, exclusivity, subordination, regularity, time_control, equipment_provided }) => ({
          name, exclusivity, subordination, regularity, time_control, equipment_provided,
        })),
        has_had_lawsuit: hasHadLawsuit,
      }
      const { data } = await api.post('/tools/labor-risk', payload)
      setResult(data)
      setStep(2)
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
      title: 'Labor Risk — Avaliação de Risco Trabalhista PJ',
      sections: [
        { label: 'Exposição geral', value: RISK_CONFIG[r.overall_exposure]?.label || r.overall_exposure },
        { label: 'Total de prestadores', value: String(r.total) },
        { label: 'Prestadores de alto risco', value: String(r.high_risk_count) },
        { label: 'Prestadores de risco médio', value: String(r.medium_risk_count) },
        { label: 'Já sofreu processo trabalhista', value: hasHadLawsuit ? 'Sim' : 'Não' },
        ...r.contractors.map((c) => ({
          label: c.name,
          value: `${RISK_CONFIG[c.risk_level]?.label} — ${c.recommendation}`,
        })),
      ],
      fileName: 'labor-risk-safie',
    })
  }

  function handleReset() {
    setContractors([makeContractor(1)])
    setHasHadLawsuit(null)
    setActiveId(1)
    setResult(null)
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-safie-light">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => step === 2 ? navigate('/dashboard') : navigate('/dashboard')}
            className="flex items-center gap-1.5 font-cta text-sm text-gray-400 hover:text-primary transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Ferramenta 3 de 6
          </p>
          <h1 className="font-heading text-3xl font-bold text-bg-dark mb-2">Labor Risk</h1>
          <p className="font-body text-sm text-gray-500">
            Avalie o risco trabalhista dos seus contratos com prestadores PJ.
          </p>
        </div>

        {step === 1 && (
          <FormStep
            contractors={contractors}
            activeId={activeId}
            active={active}
            hasHadLawsuit={hasHadLawsuit}
            setHasHadLawsuit={setHasHadLawsuit}
            onAdd={addContractor}
            onRemove={removeContractor}
            onSelect={setActiveId}
            onUpdate={updateContractor}
            onSubmit={handleSubmit}
            canSubmit={step1Valid}
            loading={loading}
            error={error}
          />
        )}

        {step === 2 && result && (
          <Results
            result={result.result}
            hasHadLawsuit={hasHadLawsuit}
            onExportPDF={handleExportPDF}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}

// ── Formulário ─────────────────────────────────────────────────────────────────

function FormStep({ contractors, activeId, active, hasHadLawsuit, setHasHadLawsuit, onAdd, onRemove, onSelect, onUpdate, onSubmit, canSubmit, loading, error }) {
  return (
    <div>
      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

        {/* Topo: lista de prestadores */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-bg-dark">Prestadores PJ</h2>
          {contractors.length < 10 && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 font-cta text-sm font-semibold text-primary hover:text-secondary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar prestador
            </button>
          )}
        </div>

        {/* Tabs de prestadores */}
        <div className="flex flex-wrap gap-2 mb-6">
          {contractors.map((c, i) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border font-cta text-sm transition-all
                ${activeId === c.id
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-primary/20'}`}
            >
              <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                {i + 1}
              </span>
              {c.name || `Prestador ${i + 1}`}
              {contractors.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); onRemove(c.id) }}
                  className="ml-0.5 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                >×</span>
              )}
            </button>
          ))}
        </div>

        {/* Formulário do prestador ativo */}
        {active && (
          <div>
            <div className="mb-6">
              <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">
                Nome ou identificação do prestador
              </label>
              <input
                type="text"
                value={active.name}
                onChange={(e) => onUpdate(active.id, 'name', e.target.value)}
                placeholder="Ex: João Silva ou Dev Frontend"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <p className="font-cta text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Indicadores de vínculo empregatício
            </p>

            <div className="flex flex-col gap-3">
              {FACTORS.map((f) => (
                <FactorToggle
                  key={f.key}
                  label={f.label}
                  desc={f.desc}
                  value={active[f.key]}
                  onChange={(v) => onUpdate(active.id, f.key, v)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pergunta sobre processo anterior */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="font-heading text-base font-bold text-bg-dark mb-1">
          Sua empresa já sofreu algum processo trabalhista?
        </h3>
        <p className="font-body text-xs text-gray-400 mb-4">
          Histórico de processos aumenta o nível de exposição geral.
        </p>
        <div className="flex gap-3">
          {[{ value: true, label: 'Sim' }, { value: false, label: 'Não' }].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setHasHadLawsuit(opt.value)}
              className={`flex-1 py-2.5 rounded-xl border font-cta text-sm font-semibold transition-all
                ${hasHadLawsuit === opt.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/30'}`}
            >
              {opt.label}
            </button>
          ))}
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
        onClick={onSubmit}
        disabled={!canSubmit || loading}
        className="w-full"
      >
        {loading ? 'Analisando...' : 'Ver avaliação de risco →'}
      </Button>

      {!canSubmit && (
        <p className="font-body text-xs text-gray-400 text-center mt-3">
          Preencha o nome de todos os prestadores e responda a pergunta sobre processos.
        </p>
      )}
    </div>
  )
}

// ── Toggle de fator ────────────────────────────────────────────────────────────

function FactorToggle({ label, desc, value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all
        ${value ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}
    >
      <div className="flex-1 pr-4">
        <p className={`font-cta text-sm font-semibold ${value ? 'text-red-700' : 'text-gray-700'}`}>{label}</p>
        <p className="font-body text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <div className={`w-10 h-6 rounded-full flex items-center transition-all duration-200 shrink-0
        ${value ? 'bg-red-500 justify-end' : 'bg-gray-200 justify-start'}`}>
        <div className="w-5 h-5 rounded-full bg-white shadow-sm mx-0.5" />
      </div>
    </div>
  )
}

// ── Resultado ──────────────────────────────────────────────────────────────────

function Results({ result, hasHadLawsuit, onExportPDF, onReset }) {
  const expConfig = RISK_CONFIG[result.overall_exposure]

  return (
    <div>
      {/* Exposição geral */}
      <div className={`rounded-2xl border p-6 mb-6 ${expConfig.bg} ${expConfig.border}`}>
        <div className="flex items-start gap-4">
          <ExposureIcon level={result.overall_exposure} />
          <div>
            <p className={`font-cta text-xs font-bold uppercase tracking-widest mb-1 ${expConfig.color}`}>
              Exposição {expConfig.short}
            </p>
            <p className="font-heading text-xl font-bold text-bg-dark mb-2">
              {result.high_risk_count} de {result.total} prestador{result.total !== 1 ? 'es' : ''} com alto risco
            </p>
            <p className="font-body text-sm text-gray-600 leading-relaxed">
              {EXPOSURE_MESSAGES[result.overall_exposure]}
            </p>
          </div>
        </div>
      </div>

      {/* Cards por prestador */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-bg-dark">Avaliação por prestador</h2>
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

        <div className="flex flex-col gap-4">
          {result.contractors.map((c, i) => {
            const cfg = RISK_CONFIG[c.risk_level]
            const activeFactors = Object.entries(c.factors).filter(([, v]) => v)
            return (
              <div key={i} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-cta text-sm font-bold text-bg-dark">{c.name}</p>
                  <span className={`font-cta text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                    {cfg.label} ({c.score}/5)
                  </span>
                </div>
                {activeFactors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {activeFactors.map(([key]) => (
                      <span key={key} className="font-body text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded-full border border-white">
                        {FACTORS.find((f) => f.key === key)?.label}
                      </span>
                    ))}
                  </div>
                )}
                <p className={`font-body text-xs leading-relaxed ${cfg.color}`}>{c.recommendation}</p>
              </div>
            )
          })}
        </div>

        {/* Resumo */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-3 gap-3">
          <MiniStat label="Total" value={result.total} />
          <MiniStat label="Alto risco" value={result.high_risk_count} highlight={result.high_risk_count > 0} />
          <MiniStat label="Proc. anterior" value={hasHadLawsuit ? 'Sim' : 'Não'} highlight={hasHadLawsuit} />
        </div>
      </div>

      {/* CTA SAFIE */}
      <div className="bg-bg-dark rounded-2xl p-6 mb-6 text-white">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Próximo passo</p>
        <h3 className="font-heading text-lg font-bold mb-2">Proteja sua empresa antes do problema chegar</h3>
        <p className="font-body text-sm text-gray-400 leading-relaxed mb-5">
          A SAFIE pode auditar seus contratos PJ, identificar os pontos críticos e propor a regularização — antes que vire processo.
        </p>
        <a
          href="https://safie.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark transition-colors px-5 py-2.5 rounded-lg"
        >
          Falar com a SAFIE
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      <button onClick={onReset} className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2">
        Fazer nova avaliação
      </button>
    </div>
  )
}

function ExposureIcon({ level }) {
  if (level === 'alto') return (
    <svg className="w-6 h-6 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
  if (level === 'medio') return (
    <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
  return (
    <svg className="w-6 h-6 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function MiniStat({ label, value, highlight = false }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="font-cta text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-heading text-lg font-bold ${highlight ? 'text-primary' : 'text-bg-dark'}`}>{value}</p>
    </div>
  )
}
