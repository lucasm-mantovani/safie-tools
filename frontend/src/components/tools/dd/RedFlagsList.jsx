import { useState } from 'react'

const CATEGORY_LABELS = {
  corporate: 'Societário', legal: 'Jurídico', financial: 'Financeiro',
  product: 'Produto', hr: 'Pessoas', commercial: 'Comercial',
  captacao_specific: 'Captação', ma_specific: 'M&A',
}

function FlagCard({ flag, resolved, onToggle, color }) {
  const isRed = color === 'red'
  const borderClass = isRed ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-400'
  const bgClass = resolved ? 'bg-gray-50 opacity-60' : 'bg-white'

  return (
    <div className={`rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${bgClass}`}>
      <div className={`${borderClass} p-5`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-2 flex-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isRed ? 'bg-red-100' : 'bg-amber-100'}`}>
              <svg className={`w-3 h-3 ${isRed ? 'text-red-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
              </svg>
            </div>
            <div>
              <p className={`font-body text-sm font-semibold leading-snug mb-1 ${resolved ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {flag.item_title}
              </p>
              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-cta text-xs">
                {CATEGORY_LABELS[flag.category] || flag.category}
              </span>
            </div>
          </div>
          <button
            onClick={() => onToggle(flag.item_id)}
            className={`shrink-0 text-xs font-cta font-medium px-3 py-1.5 rounded-lg transition-all ${
              resolved
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {resolved ? '✓ Resolvido' : 'Marcar como resolvido'}
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

        <div className={`rounded-xl px-3 py-2 ${isRed ? 'bg-red-50' : 'bg-amber-50'}`}>
          <p className={`font-body text-xs leading-relaxed ${isRed ? 'text-red-700' : 'text-amber-700'}`}>
            <span className="font-semibold">Ação recomendada: </span>{flag.recommended_action}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RedFlagsList({ flags, sessionId }) {
  const storageKey = `safie_dd_resolved_${sessionId}`
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
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <h3 className="font-heading text-lg font-bold text-bg-dark">Red Flags</h3>
        <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-cta text-xs font-semibold">
          {flags.length}
        </span>
      </div>
      <p className="font-body text-sm text-gray-500 mb-4">
        Riscos urgentes que podem bloquear ou abortar o processo se não endereçados.
      </p>
      <div className="flex flex-col gap-3">
        {flags.map(flag => (
          <FlagCard
            key={flag.item_id}
            flag={flag}
            resolved={!!resolved[flag.item_id]}
            onToggle={toggle}
            color="red"
          />
        ))}
      </div>
    </div>
  )
}
