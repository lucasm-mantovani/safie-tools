import { useState } from 'react'

const CATEGORY_LABELS = {
  corporate: 'Societário', legal: 'Jurídico', financial: 'Financeiro',
  product: 'Produto', hr: 'Pessoas', commercial: 'Comercial',
  captacao_specific: 'Captação', ma_specific: 'M&A',
}

export default function YellowFlagsList({ flags, sessionId }) {
  const storageKey = `safie_dd_resolved_yellow_${sessionId}`
  const [resolved, setResolved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}')
    } catch { return {} }
  })

  function toggle(id) {
    const next = { ...resolved, [id]: !resolved[id] }
    setResolved(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  if (!flags?.length) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <h3 className="font-heading text-lg font-bold text-bg-dark">Yellow Flags</h3>
        <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-cta text-xs font-semibold">
          {flags.length}
        </span>
      </div>
      <p className="font-body text-sm text-gray-500 mb-4">
        Pontos que requerem atenção antes do fechamento — não bloqueiam mas geram questionamentos.
      </p>
      <div className="flex flex-col gap-3">
        {flags.map(flag => (
          <div key={flag.item_id} className={`rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${resolved[flag.item_id] ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
            <div className="border-l-4 border-l-amber-400 p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className={`font-body text-sm font-semibold leading-snug mb-1 ${resolved[flag.item_id] ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {flag.item_title}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-cta text-xs">
                      {CATEGORY_LABELS[flag.category] || flag.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggle(flag.item_id)}
                  className={`shrink-0 text-xs font-cta font-medium px-3 py-1.5 rounded-lg transition-all ${
                    resolved[flag.item_id]
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {resolved[flag.item_id] ? '✓ Resolvido' : 'Marcar como resolvido'}
                </button>
              </div>

              <p className="font-body text-xs text-gray-600 leading-relaxed mb-2">
                <span className="font-semibold">Condição: </span>{flag.condition}
              </p>

              {flag.founder_description && (
                <div className="bg-gray-50 rounded-xl px-3 py-2 mb-2">
                  <p className="font-body text-xs text-gray-500 italic">"{flag.founder_description}"</p>
                </div>
              )}

              <div className="bg-amber-50 rounded-xl px-3 py-2">
                <p className="font-body text-xs text-amber-700 leading-relaxed">
                  <span className="font-semibold">Ação recomendada: </span>{flag.recommended_action}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
