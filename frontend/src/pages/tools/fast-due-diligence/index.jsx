import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import Button from '../../../components/ui/Button'
import { generatePdfFromData } from '../../../utils/pdfGenerator'

const OPERATION_OPTIONS = [
  { value: 'captacao', label: 'Captação de investimento' },
  { value: 'ma', label: 'Fusão e aquisição (M&A)' },
  { value: 'venda_participacao', label: 'Venda de participação societária' },
]
const TIMELINE_OPTIONS = [
  { value: 'ate_3', label: 'Até 3 meses' },
  { value: '3_a_6', label: '3 a 6 meses' },
  { value: '6_a_12', label: '6 a 12 meses' },
  { value: 'acima_12', label: 'Mais de 12 meses' },
]
const SIZE_OPTIONS = [
  { value: 'micro', label: 'Micro (até R$360k/ano)' },
  { value: 'pequena', label: 'Pequena (até R$4,8M/ano)' },
  { value: 'media', label: 'Média (até R$78M/ano)' },
  { value: 'grande', label: 'Grande (acima de R$78M/ano)' },
]

const AREA_ICONS = {
  societario: '⚖️', fiscal: '📊', trabalhista: '👷', propriedade_intelectual: '💡',
  compliance: '🛡️', contratos: '📋', financeiro: '💰',
}

const PRIORITY_CONFIG = {
  alta: { label: 'Prioridade Alta', badge: 'bg-red-100 text-red-700' },
  media: { label: 'Prioridade Média', badge: 'bg-amber-100 text-amber-700' },
  baixa: { label: 'Prioridade Baixa', badge: 'bg-gray-100 text-gray-500' },
}

export default function FastDueDiligence() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    operation_type: '', timeline_months: '', has_legal_advisor: null,
    company_size: '', has_shareholders_agreement: null,
  })
  const [result, setResult] = useState(null)
  const [checked, setChecked] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const canSubmit = form.operation_type && form.timeline_months && form.has_legal_advisor !== null
    && form.company_size && form.has_shareholders_agreement !== null

  function set(field, value) { setForm(p => ({ ...p, [field]: value })) }

  async function handleSubmit() {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/tools/fast-due-diligence', form)
      setResult(data)
      // inicializa checkboxes como false
      const init = {}
      data.result.areas.forEach(a => a.items.forEach(i => { init[i.id] = false }))
      setChecked(init)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  function toggleCheck(id) { setChecked(p => ({ ...p, [id]: !p[id] })) }

  function handleExportPDF() {
    if (!result) return
    const r = result.result
    const sections = [
      { label: 'Tipo de operação', value: OPERATION_OPTIONS.find(o => o.value === r.operation_type)?.label || r.operation_type },
      { label: 'Total de itens', value: String(r.total_items) },
      { label: 'Itens de alta prioridade', value: String(r.high_priority) },
      ...r.areas.flatMap(a => a.items.map(i => ({
        label: `[${a.label}] ${i.title}`,
        value: checked[i.id] ? 'Concluído' : 'Pendente',
      }))),
    ]
    generatePdfFromData({ title: 'Fast Due Diligence — Checklist', sections, fileName: 'fast-due-diligence-safie' })
  }

  if (result) {
    const r = result.result
    const totalChecked = Object.values(checked).filter(Boolean).length
    const progress = Math.round((totalChecked / r.total_items) * 100)

    return (
      <div className="min-h-screen bg-safie-light">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-8">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 font-cta text-sm text-gray-400 hover:text-primary transition-colors mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Dashboard
            </button>
            <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Ferramenta 4 de 6</p>
            <h1 className="font-heading text-3xl font-bold text-bg-dark mb-2">Fast Due Diligence</h1>
          </div>

          {/* Progresso */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-cta text-sm font-semibold text-gray-700">{totalChecked} de {r.total_items} itens concluídos</p>
              <div className="flex items-center gap-3">
                <span className="font-cta text-sm font-bold text-primary">{progress}%</span>
                <button onClick={handleExportPDF} className="flex items-center gap-1 font-cta text-xs font-semibold text-primary hover:text-secondary transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                  PDF
                </button>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Alertas */}
          {r.tight_timeline && !r.has_legal_advisor && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 flex gap-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              <div>
                <p className="font-cta text-sm font-semibold text-amber-800 mb-0.5">Prazo curto sem assessor jurídico</p>
                <p className="font-body text-xs text-amber-700">Operações com prazo inferior a 6 meses sem assessoria jurídica têm alto risco de problemas não detectados.</p>
              </div>
            </div>
          )}

          {/* Checklist por área */}
          <div className="flex flex-col gap-5 mb-6">
            {r.areas.map((area) => (
              <div key={area.area} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-base font-bold text-bg-dark">{area.label}</h3>
                  <span className="font-cta text-xs text-gray-400">{area.estimated_weeks} sem. estimadas</span>
                </div>
                <div className="flex flex-col gap-2">
                  {area.items.map((item) => (
                    <label key={item.id} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${checked[item.id] ? 'bg-primary/5' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <input
                        type="checkbox"
                        checked={!!checked[item.id]}
                        onChange={() => toggleCheck(item.id)}
                        className="mt-0.5 accent-primary w-4 h-4 shrink-0"
                      />
                      <div className="flex-1">
                        <p className={`font-body text-sm leading-snug ${checked[item.id] ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {item.title}
                        </p>
                      </div>
                      <span className={`font-cta text-xs px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_CONFIG[item.priority].badge}`}>
                        {item.priority}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-bg-dark rounded-2xl p-6 mb-6 text-white">
            <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Próximo passo</p>
            <h3 className="font-heading text-lg font-bold mb-2">Não enfrente uma due diligence sem assessoria</h3>
            <p className="font-body text-sm text-gray-400 leading-relaxed mb-5">A SAFIE coordena processos de due diligence completos — jurídico, fiscal e societário — para operações de captação, M&A e venda de participação.</p>
            <a href="https://safie.com.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary transition-colors px-5 py-2.5 rounded-lg">
              Falar com a SAFIE
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
          <button onClick={() => setResult(null)} className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2">Gerar novo checklist</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-safie-light">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 font-cta text-sm text-gray-400 hover:text-primary transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Dashboard
          </button>
          <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Ferramenta 4 de 6</p>
          <h1 className="font-heading text-3xl font-bold text-bg-dark mb-2">Fast Due Diligence</h1>
          <p className="font-body text-sm text-gray-500">Checklist personalizado para captação, M&A ou venda de participação.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-heading text-lg font-bold text-bg-dark mb-6">Sobre a operação</h2>
          <div className="flex flex-col gap-5">
            <SelectField label="Tipo de operação" value={form.operation_type} onChange={v => set('operation_type', v)} options={OPERATION_OPTIONS} placeholder="Selecione..." />
            <SelectField label="Prazo estimado da operação" value={form.timeline_months} onChange={v => set('timeline_months', v)} options={TIMELINE_OPTIONS} placeholder="Selecione..." />
            <SelectField label="Porte da empresa" value={form.company_size} onChange={v => set('company_size', v)} options={SIZE_OPTIONS} placeholder="Selecione..." />
            <YesNoField label="Já possui assessor jurídico para a operação?" value={form.has_legal_advisor} onChange={v => set('has_legal_advisor', v)} />
            <YesNoField label="A empresa possui Acordo de Sócios vigente?" value={form.has_shareholders_agreement} onChange={v => set('has_shareholders_agreement', v)} />
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4"><p className="font-body text-sm text-red-600">{error}</p></div>}

        <Button variant="primary" size="md" onClick={handleSubmit} disabled={!canSubmit || loading} className="w-full">
          {loading ? 'Gerando checklist...' : 'Gerar checklist personalizado →'}
        </Button>
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function YesNoField({ label, value, onChange }) {
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700 block mb-2">{label}</label>
      <div className="flex gap-3">
        {[{ v: true, l: 'Sim' }, { v: false, l: 'Não' }].map(opt => (
          <button key={String(opt.v)} onClick={() => onChange(opt.v)} className={`flex-1 py-2.5 rounded-xl border font-cta text-sm font-semibold transition-all ${value === opt.v ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/30'}`}>
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  )
}
