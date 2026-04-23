import { useTax } from './TaxContext'
import Button from '../../../components/ui/Button'

const FIELDS = [
  { key: 'payroll', label: 'Folha de pagamento (CLT + encargos)', hint: 'Salários brutos + FGTS + INSS patronal' },
  { key: 'documented_supplier_costs', label: 'Custos com fornecedores documentados', hint: 'Com nota fiscal — habilita créditos PIS/COFINS no Lucro Real' },
  { key: 'rent', label: 'Aluguel', hint: '' },
  { key: 'equipment_depreciation', label: 'Depreciação de equipamentos', hint: 'Estimativa mensal de desgaste dos ativos' },
  { key: 'other_documented_costs', label: 'Outros custos documentados', hint: '' },
  { key: 'rd_investment', label: 'Investimento em P&D', hint: 'Pesquisa e desenvolvimento — gera benefícios no Lucro Real' },
]

function parseBRL(str) {
  return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0
}

function maskBRL(value) {
  const num = String(value).replace(/\D/g, '')
  if (!num) return ''
  return (parseInt(num) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function StepCostStructure() {
  const { costStructure, revenueData, updateCostStructure, goToStep } = useTax()

  const totalCosts = FIELDS.reduce((sum, f) => sum + parseBRL(costStructure[f.key]), 0)
  const monthlyRevenue = parseBRL(revenueData.monthly_revenue)
  const marginPct = monthlyRevenue > 0 ? ((monthlyRevenue - totalCosts) / monthlyRevenue) * 100 : null
  const marginColor = marginPct === null
    ? 'text-gray-400'
    : marginPct >= 20 ? 'text-green-600'
    : marginPct >= 10 ? 'text-amber-600'
    : 'text-red-600'

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 flex flex-col gap-5">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="font-body text-sm font-medium text-gray-700 block mb-0.5">{f.label}</label>
            {f.hint && <p className="font-body text-xs text-gray-400 mb-1">{f.hint}</p>}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-gray-400">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={costStructure[f.key]}
                onChange={e => updateCostStructure(f.key, maskBRL(e.target.value))}
                placeholder="0,00"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Calculadora de margem em tempo real */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-cta text-xs text-gray-400 uppercase tracking-wide mb-0.5">Total de custos</p>
            <p className="font-body text-sm font-semibold text-gray-800">
              R$ {totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-cta text-xs text-gray-400 uppercase tracking-wide mb-0.5">Margem estimada</p>
            <p className={`font-heading text-2xl font-bold ${marginColor}`}>
              {marginPct !== null ? `${marginPct.toFixed(1)}%` : '—'}
            </p>
          </div>
        </div>
        {monthlyRevenue > 0 && totalCosts > monthlyRevenue && (
          <p className="font-body text-xs text-red-500 mt-2">Custos excedem o faturamento — verifique os valores.</p>
        )}
      </div>

      <Button variant="primary" size="md" onClick={() => goToStep('PARTNER_REMUNERATION')} className="w-full">
        Continuar →
      </Button>
    </div>
  )
}
