import { useTax } from './TaxContext'
import Button from '../../../components/ui/Button'

function YesNoField({ label, value, onChange }) {
  return (
    <div>
      <p className="font-body text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex gap-2">
        {[{ v: true, l: 'Sim' }, { v: false, l: 'Não' }].map(({ v, l }) => (
          <button
            key={l}
            onClick={() => onChange(v)}
            className={`flex-1 px-4 py-2.5 rounded-xl border font-body text-sm transition-all ${
              value === v
                ? 'border-primary bg-primary/5 text-primary font-medium'
                : 'border-gray-200 text-gray-700 hover:border-primary/40'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

function maskBRL(value) {
  const num = String(value).replace(/\D/g, '')
  if (!num) return ''
  return (parseInt(num) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseBRL(str) {
  return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0
}

export default function StepRevenueData() {
  const { revenueData, updateRevenueData, goToStep } = useTax()
  const { monthly_revenue, services_revenue_pct, has_seasonal_revenue, has_export_revenue, has_financial_revenue } = revenueData
  const products_pct = 100 - (services_revenue_pct ?? 100)

  const canAdvance = parseBRL(monthly_revenue) > 0
    && has_seasonal_revenue !== null
    && has_export_revenue !== null
    && has_financial_revenue !== null

  function handleRevenue(e) {
    updateRevenueData('monthly_revenue', maskBRL(e.target.value))
  }

  function handleServicesSlider(e) {
    const val = Number(e.target.value)
    updateRevenueData('services_revenue_pct', val)
    updateRevenueData('products_revenue_pct', 100 - val)
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col gap-6">
        <div>
          <label className="font-body text-sm font-medium text-gray-700 block mb-1">Faturamento mensal bruto</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-gray-400">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={monthly_revenue}
              onChange={handleRevenue}
              placeholder="0,00"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="font-body text-sm font-medium text-gray-700 block mb-3">Composição da receita</label>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-center">
              <p className="font-cta text-xs text-gray-400 mb-1">Serviços</p>
              <p className="font-cta text-xl font-bold text-primary">{services_revenue_pct}%</p>
            </div>
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
              <p className="font-cta text-xs text-gray-400 mb-1">Produtos</p>
              <p className="font-cta text-xl font-bold text-gray-700">{products_pct}%</p>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={services_revenue_pct}
            onChange={handleServicesSlider}
            className="w-full accent-primary"
          />
          <div className="flex justify-between font-cta text-xs text-gray-400 mt-1">
            <span>100% produtos</span>
            <span>100% serviços</span>
          </div>
        </div>

        <YesNoField
          label="A empresa tem receita sazonal (varia muito ao longo do ano)?"
          value={has_seasonal_revenue}
          onChange={v => updateRevenueData('has_seasonal_revenue', v)}
        />
        <YesNoField
          label="A empresa tem receita de exportação?"
          value={has_export_revenue}
          onChange={v => updateRevenueData('has_export_revenue', v)}
        />
        <YesNoField
          label="A empresa tem receita financeira (juros, aplicações)?"
          value={has_financial_revenue}
          onChange={v => updateRevenueData('has_financial_revenue', v)}
        />
      </div>

      <Button variant="primary" size="md" onClick={() => goToStep('COST_STRUCTURE')} disabled={!canAdvance} className="w-full">
        Continuar →
      </Button>
    </div>
  )
}
