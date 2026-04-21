import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import Button from '../../../components/ui/Button'
import Slider from '../../../components/ui/Slider'
import { generatePdfFromData } from '../../../utils/pdfGenerator'

const CONFLICT_OPTIONS = [
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'civel', label: 'Cível' },
  { value: 'societario', label: 'Societário' },
  { value: 'fiscal', label: 'Fiscal / Tributário' },
]
const DISPUTE_OPTIONS = [
  { value: 'ate_10k', label: 'Até R$10 mil' },
  { value: '10k_50k', label: 'R$10 mil a R$50 mil' },
  { value: '50k_200k', label: 'R$50 mil a R$200 mil' },
  { value: '200k_1M', label: 'R$200 mil a R$1 milhão' },
  { value: 'acima_1M', label: 'Acima de R$1 milhão' },
]
const INSTANCE_OPTIONS = [
  { value: 'primeira', label: '1ª instância (início)' },
  { value: 'segunda', label: '2ª instância (recurso)' },
  { value: 'superior', label: 'Tribunal Superior' },
]
const DURATION_OPTIONS = [
  { value: 'ate_1_ano', label: 'Até 1 ano' },
  { value: '1_a_3_anos', label: '1 a 3 anos' },
  { value: 'acima_3_anos', label: 'Mais de 3 anos' },
]

function fmtBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export default function LitigationCost() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    conflict_type: '', dispute_value_range: '', has_lawyer: null,
    instance: '', estimated_duration: '', success_probability: 50,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(field, value) { setForm(p => ({ ...p, [field]: value })) }

  const step1Valid = form.conflict_type && form.dispute_value_range && form.has_lawyer !== null
  const step2Valid = form.instance && form.estimated_duration

  async function handleSubmit() {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/tools/litigation-cost', form)
      setResult(data); setStep(3)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  function handleExportPDF() {
    if (!result) return
    const r = result.result
    generatePdfFromData({
      title: 'Litigation Cost — Simulação de Custo de Litígio',
      sections: [
        { label: 'Valor estimado em disputa', value: fmtBRL(r.dispute_value_estimated) },
        { label: 'Custas processuais', value: fmtBRL(r.court_fees) },
        { label: 'Honorários advocatícios', value: fmtBRL(r.lawyer_fees) },
        { label: 'Risco de condenação', value: fmtBRL(r.loss_risk) },
        { label: 'Custo de oportunidade', value: fmtBRL(r.opportunity_cost) },
        { label: 'Custo total estimado', value: fmtBRL(r.total_litigation_cost) },
        { label: 'Faixa de acordo sugerida', value: `${fmtBRL(r.settlement_range.min)} a ${fmtBRL(r.settlement_range.max)}` },
        { label: 'Recomendação', value: r.recommend_settlement ? 'Considerar acordo' : 'Litígio pode ser viável' },
      ],
      fileName: 'litigation-cost-safie',
    })
  }

  return (
    <div className="min-h-screen bg-safie-light">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <button onClick={() => step > 1 && step < 3 ? setStep(s => s - 1) : navigate('/dashboard')} className="flex items-center gap-1.5 font-cta text-sm text-gray-400 hover:text-primary transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            {step > 1 && step < 3 ? 'Voltar' : 'Dashboard'}
          </button>
          <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Ferramenta 5 de 6</p>
          <h1 className="font-heading text-3xl font-bold text-bg-dark mb-2">Litigation Cost</h1>
          <p className="font-body text-sm text-gray-500">Estime o custo real de um processo judicial e decida com dados.</p>
        </div>

        {step < 3 && <StepIndicator current={step} />}

        {step === 1 && (
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="font-heading text-lg font-bold text-bg-dark mb-6">Sobre o conflito</h2>
              <div className="flex flex-col gap-5">
                <SelectField label="Tipo de conflito" value={form.conflict_type} onChange={v => set('conflict_type', v)} options={CONFLICT_OPTIONS} placeholder="Selecione..." />
                <SelectField label="Valor aproximado em disputa" value={form.dispute_value_range} onChange={v => set('dispute_value_range', v)} options={DISPUTE_OPTIONS} placeholder="Selecione..." />
                <YesNoField label="Já possui advogado para o caso?" value={form.has_lawyer} onChange={v => set('has_lawyer', v)} />
              </div>
            </div>
            <Button variant="primary" size="md" onClick={() => setStep(2)} disabled={!step1Valid} className="w-full">Continuar →</Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="font-heading text-lg font-bold text-bg-dark mb-6">Detalhes do processo</h2>
              <div className="flex flex-col gap-6">
                <SelectField label="Instância atual ou prevista" value={form.instance} onChange={v => set('instance', v)} options={INSTANCE_OPTIONS} placeholder="Selecione..." />
                <SelectField label="Duração estimada do processo" value={form.estimated_duration} onChange={v => set('estimated_duration', v)} options={DURATION_OPTIONS} placeholder="Selecione..." />
                <div>
                  <Slider
                    label="Probabilidade de êxito estimada"
                    name="success_probability"
                    value={form.success_probability}
                    onChange={v => set('success_probability', v)}
                    formatValue={v => `${v}%`}
                  />
                  <p className="font-body text-xs text-gray-400 mt-1">Sua estimativa de ganhar a ação.</p>
                </div>
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4"><p className="font-body text-sm text-red-600">{error}</p></div>}
            <Button variant="primary" size="md" onClick={handleSubmit} disabled={!step2Valid || loading} className="w-full">
              {loading ? 'Calculando...' : 'Ver simulação →'}
            </Button>
          </div>
        )}

        {step === 3 && result && (
          <Results result={result.result} form={form} onExportPDF={handleExportPDF} onReset={() => { setForm({ conflict_type:'', dispute_value_range:'', has_lawyer:null, instance:'', estimated_duration:'', success_probability:50 }); setResult(null); setStep(1) }} />
        )}
      </div>
    </div>
  )
}

function StepIndicator({ current }) {
  const steps = ['Sobre o conflito', 'Detalhes do processo']
  return (
    <div className="flex items-center gap-3 mb-8">
      {steps.map((label, i) => {
        const n = i + 1; const active = n === current; const done = n < current
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done || active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              {done ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : n}
            </div>
            <span className={`font-cta text-xs font-medium ${active ? 'text-bg-dark' : 'text-gray-400'}`}>{label}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200 ml-1" />}
          </div>
        )
      })}
    </div>
  )
}

function Results({ result, form, onExportPDF, onReset }) {
  const r = result
  const items = [
    { label: 'Custas processuais', value: r.court_fees, color: 'bg-blue-400' },
    { label: 'Honorários advocatícios', value: r.lawyer_fees, color: 'bg-purple-400' },
    { label: 'Risco de condenação', value: r.loss_risk, color: 'bg-red-400' },
    { label: 'Custo de oportunidade', value: r.opportunity_cost, color: 'bg-amber-400' },
  ]

  return (
    <div>
      {r.recommend_settlement && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 flex gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          <div>
            <p className="font-cta text-sm font-semibold text-amber-800 mb-0.5">Acordo pode ser mais vantajoso</p>
            <p className="font-body text-xs text-amber-700">O custo total do litígio representa {r.cost_vs_value_pct}% do valor em disputa. Considere negociar entre {fmtBRL(r.settlement_range.min)} e {fmtBRL(r.settlement_range.max)}.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-bold text-bg-dark">Simulação de custos</h2>
          <button onClick={onExportPDF} className="flex items-center gap-1.5 font-cta text-xs font-semibold text-primary hover:text-secondary transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            Exportar PDF
          </button>
        </div>

        {/* Breakdown */}
        <div className="flex flex-col gap-3 mb-5">
          {items.map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-body text-sm text-gray-700">{item.label}</span>
                  <span className="font-cta text-sm font-semibold text-gray-800">{fmtBRL(item.value)}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.min((item.value / r.total_litigation_cost) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
          <span className="font-cta text-sm font-semibold text-gray-700">Custo total estimado</span>
          <span className="font-heading text-xl font-bold text-primary">{fmtBRL(r.total_litigation_cost)}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="font-cta text-xs text-gray-400 uppercase tracking-wide mb-1">Valor em disputa</p>
            <p className="font-body text-sm font-semibold text-gray-800">{fmtBRL(r.dispute_value_estimated)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="font-cta text-xs text-gray-400 uppercase tracking-wide mb-1">Faixa de acordo sugerida</p>
            <p className="font-body text-sm font-semibold text-gray-800">{fmtBRL(r.settlement_range.min)} – {fmtBRL(r.settlement_range.max)}</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-dark rounded-2xl p-6 mb-6 text-white">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Próximo passo</p>
        <h3 className="font-heading text-lg font-bold mb-2">Decida com estratégia, não com emoção</h3>
        <p className="font-body text-sm text-gray-400 leading-relaxed mb-5">A SAFIE analisa o mérito jurídico do seu caso e apresenta as melhores opções: negociar, mediar ou litigar — com números reais.</p>
        <a href="https://safie.com.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary transition-colors px-5 py-2.5 rounded-lg">
          Falar com a SAFIE
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
      </div>
      <button onClick={onReset} className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2">Nova simulação</button>
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
          <button key={String(opt.v)} onClick={() => onChange(opt.v)} className={`flex-1 py-2.5 rounded-xl border font-cta text-sm font-semibold transition-all ${value === opt.v ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/30'}`}>{opt.l}</button>
        ))}
      </div>
    </div>
  )
}
