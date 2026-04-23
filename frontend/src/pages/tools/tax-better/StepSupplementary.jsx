import { useState } from 'react'
import { useTax } from './TaxContext'
import Button from '../../../components/ui/Button'

const REVIEW_OPTIONS = [
  { value: 'menos_1_ano', label: 'Há menos de 1 ano' },
  { value: '1_a_2_anos', label: 'Entre 1 e 2 anos' },
  { value: 'mais_2_anos', label: 'Há mais de 2 anos' },
  { value: 'nunca', label: 'Nunca foi revisado' },
]

function YesNoField({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <p className="font-body text-sm text-gray-700 flex-1 pr-4 leading-snug">{label}</p>
      <div className="flex gap-2 shrink-0">
        {[{ v: true, l: 'Sim' }, { v: false, l: 'Não' }].map(({ v, l }) => (
          <button
            key={l}
            onClick={() => onChange(v)}
            className={`px-3 py-1.5 rounded-lg border font-cta text-xs font-semibold transition-all ${
              value === v
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 text-gray-500 hover:border-primary/40'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StepSupplementary() {
  const { supplementaryData, updateSupplementary, goToStep } = useTax()
  const { last_regime_review, has_rd_investment, has_export_revenue, has_real_estate, iss_rate } = supplementaryData
  const [issError, setIssError] = useState(null)

  const canAdvance = last_regime_review !== null && issError === null

  function handleIssBlur() {
    if (!iss_rate || iss_rate.trim() === '') {
      setIssError(null)
      return
    }
    const val = parseFloat(String(iss_rate).replace(',', '.'))
    if (isNaN(val) || val < 2 || val > 5) {
      setIssError('A alíquota de ISS deve estar entre 2% e 5% conforme Lei Complementar 116/2003')
    } else {
      setIssError(null)
    }
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <YesNoField
          label="Investe em pesquisa e desenvolvimento (P&D)?"
          value={has_rd_investment}
          onChange={v => updateSupplementary('has_rd_investment', v)}
        />
        <YesNoField
          label="Tem receita de exportação?"
          value={has_export_revenue}
          onChange={v => updateSupplementary('has_export_revenue', v)}
        />
        <YesNoField
          label="Possui imóvel em nome da empresa?"
          value={has_real_estate}
          onChange={v => updateSupplementary('has_real_estate', v)}
        />

        <div className="pt-4">
          <p className="font-body text-sm font-medium text-gray-700 mb-3">
            Quando foi a última revisão do regime tributário? <span className="text-red-400">*</span>
          </p>
          <div className="flex flex-col gap-2">
            {REVIEW_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => updateSupplementary('last_regime_review', opt.value)}
                className={`text-left px-4 py-3 rounded-xl border font-body text-sm transition-all ${
                  last_regime_review === opt.value
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-primary/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-5">
          <label className="font-body text-sm font-medium text-gray-700 block mb-0.5">
            Alíquota do ISS no município (%) — opcional
          </label>
          <p className="font-body text-xs text-gray-400 mb-2">Se não souber, usaremos 2% como padrão</p>
          <input
            type="text"
            inputMode="decimal"
            value={iss_rate}
            onChange={e => updateSupplementary('iss_rate', e.target.value.replace(/[^0-9,.]/g, ''))}
            onBlur={handleIssBlur}
            placeholder="Ex: 3,00"
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${issError ? 'border-red-300' : 'border-gray-200'}`}
          />
          {issError && (
            <p className="font-body text-xs text-red-500 mt-1">{issError}</p>
          )}
        </div>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={() => goToStep('QUALIFICATION_MODAL')}
        disabled={!canAdvance}
        className="w-full"
      >
        Ver diagnóstico →
      </Button>
    </div>
  )
}
