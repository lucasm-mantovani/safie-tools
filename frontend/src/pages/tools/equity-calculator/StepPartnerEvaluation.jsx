import { useState } from 'react'
import { useEquity } from './EquityContext'
import Button from '../../../components/ui/Button'

const ROLE_OPTIONS = [
  { value: 'founder',    label: 'Fundador' },
  { value: 'ceo',        label: 'CEO' },
  { value: 'cto',        label: 'CTO' },
  { value: 'coo',        label: 'COO' },
  { value: 'cmo',        label: 'CMO' },
  { value: 'vp',         label: 'VP' },
  { value: 'manager',    label: 'Gerente' },
  { value: 'specialist', label: 'Especialista' },
  { value: 'other',      label: 'Outro' },
]

const CRITICALITY_OPTIONS = [
  { value: 'critical',   label: 'Crítico — sem isso o negócio não existe' },
  { value: 'important',  label: 'Importante — acelera muito o crescimento' },
  { value: 'helpful',    label: 'Útil — agrega, mas é replicável' },
]

const OPPORTUNITY_OPTIONS = [
  { value: 'no_sacrifice',           label: 'Sem sacrifício — mantém renda atual' },
  { value: 'partial',                label: 'Parcial — redução de até 50%' },
  { value: 'significant',            label: 'Significativo — redução acima de 50%' },
  { value: 'full_salary_sacrificed', label: 'Total — abriu mão de toda a renda' },
]

const VESTING_OPTIONS = [
  { value: 'yes',         label: 'Sim — aceita vesting de 4 anos' },
  { value: 'negotiable',  label: 'Negociável — aberto a discutir prazo' },
  { value: 'no',          label: 'Não — recusa qualquer vesting' },
]

const EXCLUSIVITY_OPTIONS = [
  { value: 'exclusive',     label: 'Exclusivo — dedicação integral' },
  { value: 'partial',       label: 'Parcial — tem outro vínculo' },
  { value: 'non_exclusive', label: 'Não exclusivo — múltiplos projetos' },
]

function ScaleCards({ value, onChange, max = 5, min = 0 }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-9 h-9 rounded-lg border font-cta text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            value === n
              ? 'bg-primary border-primary text-white'
              : 'border-gray-200 text-gray-500 hover:border-gray-400'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function SelectCards({ value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-left px-4 py-2.5 rounded-xl border font-body text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            value === opt.value
              ? 'border-primary bg-primary/5 text-primary font-medium'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <div className="mb-5">
      <label className="font-body text-sm font-medium text-gray-700 block mb-1">{label}</label>
      {hint && <p className="font-body text-xs text-gray-400 mb-2">{hint}</p>}
      {children}
      {error && <p className="font-body text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function truncateName(name, idx) {
  const n = name || `Sócio ${idx + 1}`
  return n.length > 10 ? n.slice(0, 10) + '…' : n
}

export default function StepPartnerEvaluation() {
  const { partners, evaluations, updateEvaluation, goToStep } = useEquity()
  const [activeIdx, setActiveIdx] = useState(0)
  const [visited, setVisited] = useState(() => new Set([0]))
  const [showUnvisitedWarning, setShowUnvisitedWarning] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const ev = evaluations[activeIdx] || {}

  function up(dim, field, val) {
    updateEvaluation(activeIdx, dim, field, val)
  }

  function handleTabClick(i) {
    setActiveIdx(i)
    setVisited(v => new Set([...v, i]))
    setShowUnvisitedWarning(false)
  }

  function handleContinue() {
    if (visited.size < partners.length) {
      setShowUnvisitedWarning(true)
    } else {
      goToStep('COMPARATIVE_REVIEW')
    }
  }

  function handleNumber(dim, field, rawValue, min, max, errorKey) {
    const n = Number(rawValue)
    if (isNaN(n)) return
    if (n < min) {
      setFieldErrors(e => ({ ...e, [errorKey]: `O valor mínimo é ${min}.` }))
      up(dim, field, min)
      return
    }
    if (n > max) {
      setFieldErrors(e => ({ ...e, [errorKey]: `O valor máximo é ${max.toLocaleString('pt-BR')}.` }))
      up(dim, field, max)
      return
    }
    setFieldErrors(e => { const next = { ...e }; delete next[errorKey]; return next })
    up(dim, field, n)
  }

  const unvisitedCount = partners.length - visited.size

  return (
    <div>
      {/* Tabs de sócios */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {partners.map((p, i) => {
          const isVisited = visited.has(i)
          return (
            <button
              key={p.id}
              onClick={() => handleTabClick(i)}
              title={p.name || `Sócio ${i + 1}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-cta text-sm whitespace-nowrap transition-all ${
                activeIdx === i
                  ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <div
                className="w-5 h-5 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              {truncateName(p.name, i)}
              {isVisited && (
                <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-heading text-lg font-bold text-bg-dark mb-6">
          {partners[activeIdx]?.name || `Sócio ${activeIdx + 1}`}
        </h2>

        {/* Capital */}
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-4">Capital</p>
        <Field
          label="Aporte financeiro (R$)"
          error={fieldErrors['financial_investment']}
        >
          <input
            type="number"
            min="0"
            max="999999999"
            value={ev.capital?.financial_investment ?? 0}
            onChange={e => handleNumber('capital', 'financial_investment', e.target.value, 0, 999999999, 'financial_investment')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </Field>
        <Field
          label="Bens não financeiros aportados"
          hint="0 = nenhum, 5 = máximo"
        >
          <ScaleCards value={ev.capital?.non_financial_assets ?? 0} onChange={v => up('capital', 'non_financial_assets', v)} />
        </Field>
        <Field
          label="Garantias financeiras"
          hint="1 = baixa, 5 = alta"
        >
          <ScaleCards value={ev.capital?.financial_guarantees ?? 1} min={1} onChange={v => up('capital', 'financial_guarantees', v)} />
        </Field>

        <hr className="my-5 border-gray-100" />

        {/* Work */}
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-4">Trabalho</p>
        <Field
          label="Horas semanais dedicadas"
          hint="Valor sugerido — ajuste conforme necessário."
          error={fieldErrors['weekly_hours']}
        >
          <input
            type="number"
            min="0"
            max="168"
            value={ev.work?.weekly_hours ?? 40}
            onChange={e => handleNumber('work', 'weekly_hours', e.target.value, 0, 168, 'weekly_hours')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </Field>
        <Field
          label="Papel na empresa"
          hint="Valor sugerido — ajuste conforme necessário."
        >
          <select
            value={ev.work?.role_type ?? 'founder'}
            onChange={e => up('work', 'role_type', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field
          label="Anos de experiência relevante"
          error={fieldErrors['years_experience']}
        >
          <input
            type="number"
            min="0"
            max="60"
            value={ev.work?.years_experience ?? 0}
            onChange={e => handleNumber('work', 'years_experience', e.target.value, 0, 60, 'years_experience')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </Field>
        <Field
          label="Meses de dedicação pré-empresa"
          error={fieldErrors['pre_company_dedication_months']}
        >
          <input
            type="number"
            min="0"
            max="600"
            value={ev.work?.pre_company_dedication_months ?? 0}
            onChange={e => handleNumber('work', 'pre_company_dedication_months', e.target.value, 0, 600, 'pre_company_dedication_months')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </Field>

        <hr className="my-5 border-gray-100" />

        {/* Knowledge */}
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-4">Conhecimento</p>
        <Field label="Propriedade intelectual aportada" hint="0 = nenhuma, 5 = máxima">
          <ScaleCards value={ev.knowledge?.intellectual_property ?? 0} onChange={v => up('knowledge', 'intellectual_property', v)} />
        </Field>
        <Field label="Criticidade da propriedade intelectual">
          <SelectCards value={ev.knowledge?.ip_criticality ?? 'helpful'} onChange={v => up('knowledge', 'ip_criticality', v)} options={CRITICALITY_OPTIONS} />
        </Field>
        <Field label="Rede e acesso a mercado" hint="0 = nenhum, 5 = máximo">
          <ScaleCards value={ev.knowledge?.network_and_market_access ?? 0} onChange={v => up('knowledge', 'network_and_market_access', v)} />
        </Field>
        <Field label="Expertise técnica" hint="0 = nenhuma, 5 = máxima">
          <ScaleCards value={ev.knowledge?.technical_expertise ?? 0} onChange={v => up('knowledge', 'technical_expertise', v)} />
        </Field>
        <Field label="Criticidade da expertise técnica">
          <SelectCards value={ev.knowledge?.tech_criticality ?? 'helpful'} onChange={v => up('knowledge', 'tech_criticality', v)} options={CRITICALITY_OPTIONS} />
        </Field>

        <hr className="my-5 border-gray-100" />

        {/* Risk */}
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-4">Risco</p>
        <Field label="Custo de oportunidade">
          <SelectCards value={ev.risk?.opportunity_cost ?? 'no_sacrifice'} onChange={v => up('risk', 'opportunity_cost', v)} options={OPPORTUNITY_OPTIONS} />
        </Field>
        <Field label="Aceita vesting?">
          <SelectCards value={ev.risk?.vesting_acceptance ?? 'yes'} onChange={v => up('risk', 'vesting_acceptance', v)} options={VESTING_OPTIONS} />
        </Field>
        <Field label="Exclusividade">
          <SelectCards value={ev.risk?.exclusivity ?? 'exclusive'} onChange={v => up('risk', 'exclusivity', v)} options={EXCLUSIVITY_OPTIONS} />
        </Field>
      </div>

      {/* Alerta de sócios não visitados */}
      {showUnvisitedWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-4">
          <p className="font-cta text-sm font-semibold text-amber-800 mb-1">
            {unvisitedCount === 1
              ? 'Você ainda não avaliou 1 sócio.'
              : `Você ainda não avaliou ${unvisitedCount} sócios.`}
          </p>
          <p className="font-body text-xs text-amber-700 mb-3">
            Os sócios não avaliados usarão valores padrão. Deseja continuar mesmo assim?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => goToStep('COMPARATIVE_REVIEW')}
              className="font-cta text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg transition-colors"
            >
              Continuar mesmo assim
            </button>
            <button
              onClick={() => setShowUnvisitedWarning(false)}
              className="font-cta text-xs text-amber-700 hover:text-amber-900 px-4 py-2 transition-colors"
            >
              Voltar para avaliar
            </button>
          </div>
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        onClick={handleContinue}
        className="w-full"
      >
        Continuar para revisão →
      </Button>
    </div>
  )
}
