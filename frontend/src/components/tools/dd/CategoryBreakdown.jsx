import { useState } from 'react'

const CATEGORY_META = {
  corporate: { label: 'Estrutura Societária e Governança', emoji: '🏛️' },
  legal: { label: 'Jurídico e Contencioso', emoji: '⚖️' },
  financial: { label: 'Financeiro e Contábil', emoji: '💰' },
  product: { label: 'Produto e Tecnologia', emoji: '💻' },
  hr: { label: 'Pessoas e Cultura', emoji: '👥' },
  commercial: { label: 'Comercial e Mercado', emoji: '📈' },
  captacao_specific: { label: 'Específico para Captação', emoji: '🚀' },
  ma_specific: { label: 'Específico para M&A', emoji: '🤝' },
}

const STATUS_CONFIG = {
  ok: { label: 'Ok', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  parcial: { label: 'Parcial', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
  ausente: { label: 'Ausente', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  nao_aplicavel: { label: 'N/A', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
}

function CategoryAccordion({ catId, score, diagnostic, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const meta = CATEGORY_META[catId] || { label: catId, emoji: '📋' }

  const catResponses = diagnostic.red_flags
    .concat(diagnostic.yellow_flags)
    .filter(f => f.category === catId)

  const allItemIds = diagnostic.red_flags
    .concat(diagnostic.yellow_flags)
    .filter(f => f.category === catId)
    .map(f => f.item_id)

  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'
  const flagsInCat = diagnostic.red_flags.filter(f => f.category === catId).length +
    diagnostic.yellow_flags.filter(f => f.category === catId).length

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{meta.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-semibold text-gray-800">{meta.label}</p>
          {flagsInCat > 0 && (
            <p className="font-body text-xs text-gray-400">{flagsInCat} flag{flagsInCat > 1 ? 's' : ''} identificado{flagsInCat > 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-cta text-sm font-bold ${scoreColor}`}>{score}%</span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-4 pt-3">
          {catResponses.length === 0 ? (
            <p className="font-body text-xs text-gray-400 py-2">Nenhum flag identificado nesta categoria.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {catResponses.map(flag => {
                const isRed = diagnostic.red_flags.some(f => f.item_id === flag.item_id)
                const cfg = isRed ? STATUS_CONFIG.ausente : STATUS_CONFIG.parcial
                return (
                  <div key={flag.item_id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1.5 shrink-0`} />
                    <div className="flex-1">
                      <p className="font-body text-xs font-medium text-gray-700">{flag.item_title}</p>
                      {flag.founder_description && (
                        <p className="font-body text-xs text-gray-400 italic mt-0.5">"{flag.founder_description}"</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-cta text-xs ${cfg.bg} ${cfg.text} shrink-0`}>
                      {isRed ? 'Red' : 'Yellow'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CategoryBreakdown({ diagnostic }) {
  const { category_order, category_scores } = diagnostic
  if (!category_order?.length) return null

  return (
    <div>
      <h3 className="font-heading text-lg font-bold text-bg-dark mb-4">Detalhamento por categoria</h3>
      <div className="flex flex-col gap-2">
        {category_order.map((catId, i) => (
          <CategoryAccordion
            key={catId}
            catId={catId}
            score={category_scores?.[catId] ?? 0}
            diagnostic={diagnostic}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </div>
  )
}
