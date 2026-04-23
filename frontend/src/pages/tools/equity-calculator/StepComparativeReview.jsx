import { useEquity, DEFAULT_EVAL } from './EquityContext'
import Button from '../../../components/ui/Button'

const ROLE_LABELS = {
  founder: 'Fundador', ceo: 'CEO', cto: 'CTO', coo: 'COO',
  cmo: 'CMO', vp: 'VP', manager: 'Gerente', specialist: 'Especialista', other: 'Outro',
}

const OPPORTUNITY_COST_LABELS = {
  no_sacrifice: 'Sem sacrifício', partial: 'Parcial (até 50%)',
  significant: 'Significativo (>50%)', full_salary_sacrificed: 'Total',
}

const VESTING_LABELS = {
  yes: 'Sim — 4 anos', negotiable: 'Negociável', no: 'Não aceita',
}

const EXCLUSIVITY_LABELS = {
  exclusive: 'Exclusivo', partial: 'Parcial', non_exclusive: 'Não exclusivo',
}

const CRITICALITY_LABELS = {
  critical: 'Crítico', important: 'Importante', helpful: 'Útil',
}

const CRITERIA_LABELS = {
  'capital.financial_investment':       { label: 'Aporte financeiro (R$)', fmt: v => `R$ ${Number(v).toLocaleString('pt-BR')}` },
  'capital.non_financial_assets':       { label: 'Bens não financeiros (0–5)', fmt: v => v },
  'capital.financial_guarantees':       { label: 'Garantias financeiras (1–5)', fmt: v => v },
  'work.weekly_hours':                  { label: 'Horas semanais', fmt: v => `${v}h` },
  'work.role_type':                     { label: 'Papel', fmt: v => ROLE_LABELS[v] || v },
  'work.years_experience':              { label: 'Anos de experiência', fmt: v => `${v} anos` },
  'work.pre_company_dedication_months': { label: 'Meses pré-empresa', fmt: v => `${v} meses` },
  'knowledge.intellectual_property':    { label: 'Propriedade intelectual (0–5)', fmt: v => v },
  'knowledge.ip_criticality':           { label: 'Criticidade da PI', fmt: v => CRITICALITY_LABELS[v] || v },
  'knowledge.network_and_market_access':{ label: 'Rede e mercado (0–5)', fmt: v => v },
  'knowledge.technical_expertise':      { label: 'Expertise técnica (0–5)', fmt: v => v },
  'knowledge.tech_criticality':         { label: 'Criticidade da expertise', fmt: v => CRITICALITY_LABELS[v] || v },
  'risk.opportunity_cost':              { label: 'Custo de oportunidade', fmt: v => OPPORTUNITY_COST_LABELS[v] || v },
  'risk.vesting_acceptance':            { label: 'Aceita vesting?', fmt: v => VESTING_LABELS[v] || v },
  'risk.exclusivity':                   { label: 'Exclusividade', fmt: v => EXCLUSIVITY_LABELS[v] || v },
}

function isDefaultEval(evaluation) {
  if (!evaluation) return true
  return JSON.stringify(evaluation) === JSON.stringify(DEFAULT_EVAL)
}

export default function StepComparativeReview() {
  const { partners, evaluations, goToStep } = useEquity()

  const rows = Object.entries(CRITERIA_LABELS)

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6 overflow-x-auto">
        <h2 className="font-heading text-lg font-bold text-bg-dark mb-5">Revisão comparativa</h2>

        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr>
              <th className="text-left font-cta text-xs text-gray-400 uppercase tracking-wide pb-3 pr-4">Critério</th>
              {partners.map((p, i) => {
                const hasDefaults = isDefaultEval(evaluations[i])
                return (
                  <th key={p.id} className="text-center font-cta text-xs font-semibold pb-3 px-2" style={{ color: p.color }}>
                    <span>{p.name || `Sócio ${i + 1}`}</span>
                    {hasDefaults && (
                      <span className="ml-1" title="Sócio com valores padrão — não foi avaliado">⚠️</span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map(([key, meta]) => {
              const [dim, field] = key.split('.')
              const values = partners.map((_, i) => evaluations[i]?.[dim]?.[field])
              const numVals = values.map(v => Number(v)).filter(v => !isNaN(v))
              const maxVal = numVals.length ? Math.max(...numVals) : null
              return (
                <tr key={key} className="border-t border-gray-50">
                  <td className="font-body text-xs text-gray-500 py-2.5 pr-4 whitespace-nowrap">{meta.label}</td>
                  {values.map((v, i) => {
                    const isMax = maxVal !== null && Number(v) === maxVal && maxVal > 0
                    return (
                      <td
                        key={i}
                        className={`text-center font-body text-xs py-2.5 px-2 rounded ${isMax ? 'font-semibold' : ''}`}
                        style={isMax ? { color: partners[i].color } : { color: '#6b7280' }}
                      >
                        {v !== undefined ? meta.fmt(v) : '—'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={() => goToStep('QUALIFICATION_MODAL')}
        className="w-full"
      >
        Ver resultado →
      </Button>

      <p className="font-body text-xs text-gray-400 text-center mt-3">
        Antes de exibir o resultado, faremos 4 perguntas rápidas sobre sua empresa (menos de 1 minuto).
        A última pergunta é opcional — recusar contato não impede o acesso ao resultado.
      </p>
    </div>
  )
}
