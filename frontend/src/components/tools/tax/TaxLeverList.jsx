import { useState } from 'react'

const COMPLEXITY_CONFIG = {
  low: { label: 'Baixa complexidade', cls: 'bg-green-100 text-green-700' },
  medium: { label: 'Média complexidade', cls: 'bg-amber-100 text-amber-700' },
  high: { label: 'Alta complexidade', cls: 'bg-red-100 text-red-700' },
}

export default function TaxLeverList({ levers }) {
  const [openIdx, setOpenIdx] = useState(null)

  if (!levers?.length) return null

  const sorted = [...levers].sort((a, b) => (b.annual_savings ?? 0) - (a.annual_savings ?? 0))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
      <h3 className="font-heading text-base font-bold text-bg-dark mb-1">Alavancas de economia</h3>
      <p className="font-body text-xs text-gray-400 mb-4">Ordenadas por impacto anual — clique para expandir</p>

      <div className="flex flex-col gap-2">
        {sorted.map((lever, i) => {
          const complexity = COMPLEXITY_CONFIG[lever.complexity] || COMPLEXITY_CONFIG.medium
          const isOpen = openIdx === i
          return (
            <div key={lever.key || i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-gray-800 mb-1">{lever.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {lever.annual_savings > 0 && (
                      <span className="font-cta text-xs font-semibold text-green-600">
                        Economia: {lever.annual_savings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano
                      </span>
                    )}
                    <span className={`font-cta text-xs px-2 py-0.5 rounded-full ${complexity.cls}`}>
                      {complexity.label}
                    </span>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                  <p className="font-body text-sm text-gray-600 leading-relaxed pt-3">{lever.description}</p>
                  {lever.monthly_savings > 0 && (
                    <p className="font-cta text-xs text-gray-400 mt-2">
                      Economia mensal estimada: {lever.monthly_savings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
