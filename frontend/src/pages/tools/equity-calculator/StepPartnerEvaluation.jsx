// TODO: adicionar RadarChart (Recharts) por sócio; melhorar inputs com descrições detalhadas
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
  { value: 'no_sacrifice',         label: 'Sem sacrifício — mantém renda atual' },
  { value: 'partial',              label: 'Parcial — redução de até 50%' },
  { value: 'significant',          label: 'Significativo — redução acima de 50%' },
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

function ScaleCards({ value, onChange, max = 5 }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: max + 1 }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`w-9 h-9 rounded-lg border font-cta text-sm font-bold transition-all ${
            value === i
              ? 'bg-primary border-primary text-white'
              : 'border-gray-200 text-gray-500 hover:border-primary/40'
          }`}
        >
          {i}
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
          className={`text-left px-4 py-2.5 rounded-xl border font-body text-sm transition-all ${
            value === opt.value
              ? 'border-primary bg-primary/5 text-primary font-medium'
              : 'border-gray-200 text-gray-700 hover:border-primary/40'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-5">
      <label className="font-body text-sm font-medium text-gray-700 block mb-2">{label}</label>
      {children}
    </div>
  )
}

export default function StepPartnerEvaluation() {
  const { partners, evaluations, updateEvaluation, goToStep } = useEquity()
  const [activeIdx, setActiveIdx] = useState(0)

  const ev = evaluations[activeIdx] || {}

  function up(dim, field, val) {
    updateEvaluation(activeIdx, dim, field, val)
  }

  return (
    <div>
      {/* Tabs de sócios */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {partners.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveIdx(i)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-cta text-sm whitespace-nowrap transition-all ${
              activeIdx === i
                ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-primary/20'
            }`}
          >
            <div
              className="w-5 h-5 rounded-full shrink-0"
              style={{ backgroundColor: p.color }}
            />
            {p.name || `Sócio ${i + 1}`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-heading text-lg font-bold text-bg-dark mb-6">
          {partners[activeIdx]?.name || `Sócio ${activeIdx + 1}`}
        </h2>

        {/* Capital */}
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-4">Capital</p>
        <Field label="Aporte financeiro (R$)">
          <input
            type="number"
            min="0"
            value={ev.capital?.financial_investment ?? 0}
            onChange={e => up('capital', 'financial_investment', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </Field>
        <Field label="Bens não financeiros aportados (0–5)">
          <ScaleCards value={ev.capital?.non_financial_assets ?? 0} onChange={v => up('capital', 'non_financial_assets', v)} />
        </Field>
        <Field label="Garantias financeiras (1–5)">
          <ScaleCards value={ev.capital?.financial_guarantees ?? 1} onChange={v => up('capital', 'financial_guarantees', Math.max(1, v))} />
        </Field>

        <hr className="my-5 border-gray-100" />

        {/* Work */}
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-4">Trabalho</p>
        <Field label="Horas semanais dedicadas">
          <input
            type="number"
            min="0"
            max="168"
            value={ev.work?.weekly_hours ?? 40}
            onChange={e => up('work', 'weekly_hours', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </Field>
        <Field label="Papel na empresa">
          <select
            value={ev.work?.role_type ?? 'founder'}
            onChange={e => up('work', 'role_type', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Anos de experiência relevante">
          <input
            type="number"
            min="0"
            max="50"
            value={ev.work?.years_experience ?? 0}
            onChange={e => up('work', 'years_experience', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </Field>
        <Field label="Meses de dedicação pré-empresa">
          <input
            type="number"
            min="0"
            max="120"
            value={ev.work?.pre_company_dedication_months ?? 0}
            onChange={e => up('work', 'pre_company_dedication_months', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </Field>

        <hr className="my-5 border-gray-100" />

        {/* Knowledge */}
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-4">Conhecimento</p>
        <Field label="Propriedade intelectual aportada (0–5)">
          <ScaleCards value={ev.knowledge?.intellectual_property ?? 0} onChange={v => up('knowledge', 'intellectual_property', v)} />
        </Field>
        <Field label="Criticidade da propriedade intelectual">
          <SelectCards value={ev.knowledge?.ip_criticality ?? 'helpful'} onChange={v => up('knowledge', 'ip_criticality', v)} options={CRITICALITY_OPTIONS} />
        </Field>
        <Field label="Rede e acesso a mercado (0–5)">
          <ScaleCards value={ev.knowledge?.network_and_market_access ?? 0} onChange={v => up('knowledge', 'network_and_market_access', v)} />
        </Field>
        <Field label="Expertise técnica (0–5)">
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

      <Button
        variant="primary"
        size="md"
        onClick={() => goToStep('COMPARATIVE_REVIEW')}
        className="w-full"
      >
        Continuar para revisão →
      </Button>
    </div>
  )
}
