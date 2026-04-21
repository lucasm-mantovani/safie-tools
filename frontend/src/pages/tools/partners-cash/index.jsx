import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import Button from '../../../components/ui/Button'
import { generatePdfFromData } from '../../../utils/pdfGenerator'

const REVENUE_OPTIONS = [
  { value: 'ate_10k', label: 'Até R$10 mil/mês' },
  { value: '10k_30k', label: 'R$10 mil a R$30 mil/mês' },
  { value: '30k_80k', label: 'R$30 mil a R$80 mil/mês' },
  { value: '80k_200k', label: 'R$80 mil a R$200 mil/mês' },
  { value: 'acima_200k', label: 'Acima de R$200 mil/mês' },
]
const REGIME_OPTIONS = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
]
const PROLABORE_OPTIONS = [
  { value: 'salario_minimo', label: 'R$1.412 (salário mínimo)' },
  { value: 'ate_5k', label: 'Até R$5 mil' },
  { value: '5k_a_10k', label: 'R$5 mil a R$10 mil' },
  { value: '10k_a_20k', label: 'R$10 mil a R$20 mil' },
  { value: 'acima_20k', label: 'Acima de R$20 mil' },
]

function fmtBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export default function PartnersCash() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    monthly_revenue_range: '', tax_regime: '', current_prolabore_range: '',
    partners_receiving: 1, has_accountant: null,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(field, value) { setForm(p => ({ ...p, [field]: value })) }

  const canSubmit = form.monthly_revenue_range && form.tax_regime && form.current_prolabore_range
    && form.partners_receiving >= 1 && form.has_accountant !== null

  async function handleSubmit() {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/tools/partners-cash', form)
      setResult(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  function handleExportPDF() {
    if (!result) return
    const r = result.result
    generatePdfFromData({
      title: 'Partners Cash — Otimização de Pró-labore e Dividendos',
      sections: [
        { label: 'Pró-labore atual', value: fmtBRL(r.current.prolabore) },
        { label: 'INSS atual', value: fmtBRL(r.current.inss) },
        { label: 'IR atual', value: fmtBRL(r.current.ir) },
        { label: 'Remuneração líquida atual', value: fmtBRL(r.current.net_income) },
        { label: '---', value: '---' },
        { label: 'Pró-labore otimizado', value: fmtBRL(r.optimized.prolabore) },
        { label: 'Dividendos estimados', value: fmtBRL(r.optimized.dividends) },
        { label: 'Remuneração líquida otimizada', value: fmtBRL(r.optimized.net_income) },
        { label: 'Economia mensal estimada', value: fmtBRL(r.monthly_savings) },
        { label: 'Economia anual estimada', value: fmtBRL(r.annual_savings) },
      ],
      fileName: 'partners-cash-safie',
    })
  }

  return (
    <div className="min-h-screen bg-safie-light">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 font-cta text-sm text-gray-400 hover:text-primary transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Dashboard
          </button>
          <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Ferramenta 6 de 6</p>
          <h1 className="font-heading text-3xl font-bold text-bg-dark mb-2">Partners Cash</h1>
          <p className="font-body text-sm text-gray-500">Descubra o mix ideal de pró-labore e dividendos para maximizar sua remuneração líquida.</p>
        </div>

        {!result ? (
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="font-heading text-lg font-bold text-bg-dark mb-6">Dados da empresa e do sócio</h2>
              <div className="flex flex-col gap-5">
                <SelectField label="Faturamento mensal da empresa" value={form.monthly_revenue_range} onChange={v => set('monthly_revenue_range', v)} options={REVENUE_OPTIONS} placeholder="Selecione..." />
                <SelectField label="Regime tributário" value={form.tax_regime} onChange={v => set('tax_regime', v)} options={REGIME_OPTIONS} placeholder="Selecione..." />
                <SelectField label="Pró-labore atual (por sócio)" value={form.current_prolabore_range} onChange={v => set('current_prolabore_range', v)} options={PROLABORE_OPTIONS} placeholder="Selecione..." />
                <div>
                  <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Quantos sócios recebem pró-labore?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => set('partners_receiving', n)} className={`flex-1 py-2.5 rounded-xl border font-cta text-sm font-bold transition-all ${form.partners_receiving === n ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/30'}`}>{n}</button>
                    ))}
                  </div>
                </div>
                <YesNoField label="A empresa possui contador ativo?" value={form.has_accountant} onChange={v => set('has_accountant', v)} />
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4"><p className="font-body text-sm text-red-600">{error}</p></div>}

            <Button variant="primary" size="md" onClick={handleSubmit} disabled={!canSubmit || loading} className="w-full">
              {loading ? 'Calculando...' : 'Calcular mix ideal →'}
            </Button>
          </div>
        ) : (
          <Results result={result.result} form={form} onExportPDF={handleExportPDF} onReset={() => setResult(null)} />
        )}
      </div>
    </div>
  )
}

function Results({ result, form, onExportPDF, onReset }) {
  const r = result
  const hasSavings = r.monthly_savings > 0

  return (
    <div>
      {/* Destaque economia */}
      <div className={`rounded-2xl border p-6 mb-6 ${hasSavings ? 'bg-primary/5 border-primary/20' : 'bg-green-50 border-green-200'}`}>
        <p className={`font-cta text-xs font-bold uppercase tracking-widest mb-1 ${hasSavings ? 'text-primary' : 'text-green-700'}`}>
          {hasSavings ? 'Potencial de otimização' : 'Pró-labore já otimizado'}
        </p>
        <p className="font-heading text-2xl font-bold text-bg-dark mb-1">
          {hasSavings ? `${fmtBRL(r.monthly_savings)}/mês` : 'Sem ganho adicional estimado'}
        </p>
        {hasSavings && (
          <p className="font-body text-sm text-gray-500">{fmtBRL(r.annual_savings)} de economia estimada por ano</p>
        )}
      </div>

      {/* Comparativo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-bg-dark">Comparativo de cenários</h2>
          <button onClick={onExportPDF} className="flex items-center gap-1.5 font-cta text-xs font-semibold text-primary hover:text-secondary transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            Exportar PDF
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Cenário atual */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-cta text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Cenário atual</p>
            <div className="flex flex-col gap-2">
              <CashRow label="Pró-labore" value={fmtBRL(r.current.prolabore)} />
              <CashRow label="INSS" value={`- ${fmtBRL(r.current.inss)}`} negative />
              <CashRow label="IR" value={`- ${fmtBRL(r.current.ir)}`} negative />
              <div className="border-t border-gray-200 pt-2 mt-1">
                <CashRow label="Líquido" value={fmtBRL(r.current.net_income)} bold />
              </div>
            </div>
          </div>

          {/* Cenário otimizado */}
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/15">
            <p className="font-cta text-xs font-semibold text-primary uppercase tracking-wide mb-3">Cenário otimizado</p>
            <div className="flex flex-col gap-2">
              <CashRow label="Pró-labore" value={fmtBRL(r.optimized.prolabore)} />
              <CashRow label="INSS" value={`- ${fmtBRL(r.optimized.inss)}`} negative />
              <CashRow label="IR" value={`- ${fmtBRL(r.optimized.ir)}`} negative />
              <CashRow label="Dividendos*" value={`+ ${fmtBRL(r.optimized.dividends)}`} positive />
              <div className="border-t border-primary/15 pt-2 mt-1">
                <CashRow label="Líquido" value={fmtBRL(r.optimized.net_income)} bold primary />
              </div>
            </div>
          </div>
        </div>

        <p className="font-body text-xs text-gray-400 mt-4">
          * Dividendos são isentos de IR no Simples Nacional e Lucro Presumido. Estimativa baseada em 20% do faturamento disponível para distribuição.
        </p>

        {r.dividends_taxable && (
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <p className="font-body text-xs text-amber-700">No Lucro Real, dividendos podem ter tributação adicional. Consulte um contador para análise precisa.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-bg-dark rounded-2xl p-6 mb-6 text-white">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Próximo passo</p>
        <h3 className="font-heading text-lg font-bold mb-2">Maximize o que você leva para casa</h3>
        <p className="font-body text-sm text-gray-400 leading-relaxed mb-5">A SAFIE faz a análise completa do seu mix de remuneração considerando seu regime, distribuição de resultados e planejamento tributário pessoal.</p>
        <a href="https://safie.com.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary transition-colors px-5 py-2.5 rounded-lg">
          Falar com a SAFIE
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
      </div>
      <button onClick={onReset} className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2">Nova simulação</button>
    </div>
  )
}

function CashRow({ label, value, negative, positive, bold, primary }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-body text-xs text-gray-500">{label}</span>
      <span className={`font-cta text-xs ${bold ? 'text-sm font-bold' : 'font-semibold'} ${primary ? 'text-primary' : negative ? 'text-red-500' : positive ? 'text-green-600' : 'text-gray-800'}`}>
        {value}
      </span>
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
