// TODO: adicionar PieChart (Recharts) ao lado dos sliders
import { useEquity, DEFAULT_WEIGHTS } from './EquityContext'
import Button from '../../../components/ui/Button'

const DIMENSIONS = [
  { key: 'capital',    label: 'Capital',      desc: 'Aportes financeiros, bens e garantias' },
  { key: 'work',       label: 'Trabalho',     desc: 'Dedicação, horas, papel e experiência' },
  { key: 'knowledge',  label: 'Conhecimento', desc: 'Propriedade intelectual, rede e expertise técnica' },
  { key: 'risk',       label: 'Risco',        desc: 'Custo de oportunidade, vesting e exclusividade' },
]

export default function StepDimensionWeights() {
  const { dimensionWeights, suggestedWeights, setDimensionWeights, goToStep } = useEquity()

  const total = Object.values(dimensionWeights).reduce((a, b) => a + b, 0)
  const isValid = total === 100

  function handleChange(key, raw) {
    const value = Math.max(0, Math.min(100, Number(raw)))
    const others = DIMENSIONS.filter(d => d.key !== key)
    const remaining = 100 - value
    const otherSum = others.reduce((s, d) => s + dimensionWeights[d.key], 0)
    const adjusted = {}
    if (otherSum === 0) {
      const each = Math.floor(remaining / others.length)
      others.forEach((d, i) => {
        adjusted[d.key] = i === others.length - 1 ? remaining - each * (others.length - 1) : each
      })
    } else {
      others.forEach(d => {
        adjusted[d.key] = Math.round((dimensionWeights[d.key] / otherSum) * remaining)
      })
      // corrigir arredondamento
      const adjSum = Object.values(adjusted).reduce((a, b) => a + b, 0)
      const diff = remaining - adjSum
      if (diff !== 0) adjusted[others[0].key] += diff
    }
    setDimensionWeights({ ...dimensionWeights, [key]: value, ...adjusted })
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-bg-dark">Pesos das dimensões</h2>
          <span className={`font-cta text-sm font-bold ${isValid ? 'text-primary' : 'text-red-500'}`}>
            {total}% / 100%
          </span>
        </div>

        <div className="flex flex-col gap-6">
          {DIMENSIONS.map(d => (
            <div key={d.key}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-body text-sm font-medium text-gray-800">{d.label}</span>
                  <p className="font-body text-xs text-gray-400">{d.desc}</p>
                </div>
                <span className="font-cta text-base font-bold text-primary ml-4 w-12 text-right">
                  {dimensionWeights[d.key]}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={dimensionWeights[d.key]}
                onChange={e => handleChange(d.key, e.target.value)}
                className="w-full accent-primary"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setDimensionWeights({ ...suggestedWeights })}
        className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2 mb-4"
      >
        Restaurar pesos sugeridos
      </button>

      <Button
        variant="primary"
        size="md"
        onClick={() => goToStep('PARTNER_EVALUATION')}
        disabled={!isValid}
        className="w-full"
      >
        Continuar para avaliação →
      </Button>

      {!isValid && (
        <p className="font-body text-xs text-red-400 text-center mt-3">
          A soma dos pesos deve ser exatamente 100%.
        </p>
      )}
    </div>
  )
}
