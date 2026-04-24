import { useState } from 'react'
import { useDD } from './DDContext'

const RESPONSE_BUTTONS = [
  {
    value: 'ok',
    label: '✓ Ok',
    activeClass: 'bg-emerald-500 text-white border-emerald-500',
    inactiveClass: 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700',
  },
  {
    value: 'parcial',
    label: '⚠ Parcial',
    activeClass: 'bg-amber-400 text-white border-amber-400',
    inactiveClass: 'bg-gray-50 text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700',
  },
  {
    value: 'ausente',
    label: '✗ Ausente',
    activeClass: 'bg-red-500 text-white border-red-500',
    inactiveClass: 'bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700',
  },
  {
    value: 'nao_aplicavel',
    label: '— N/A',
    activeClass: 'bg-gray-400 text-white border-gray-400',
    inactiveClass: 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300',
  },
]

export default function ChecklistItem({ item }) {
  const { checklistResponses, setItemResponse, setItemDescription } = useDD()
  const [expanded, setExpanded] = useState(false)

  const response = checklistResponses[item.id] || {}
  const currentStatus = response.status || null
  const currentDescription = response.founder_description || ''
  const showTextField = currentStatus === 'parcial' || currentStatus === 'ausente'

  const weightColor = item.weight === 3 ? 'bg-red-100 text-red-700' : item.weight === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
  const weightLabel = item.weight === 3 ? 'Crítico' : item.weight === 2 ? 'Importante' : 'Padrão'

  return (
    <div className={`rounded-2xl border transition-all ${
      currentStatus === 'ok' ? 'border-emerald-200 bg-emerald-50/30' :
      currentStatus === 'parcial' ? 'border-amber-200 bg-amber-50/30' :
      currentStatus === 'ausente' ? 'border-red-200 bg-red-50/30' :
      currentStatus === 'nao_aplicavel' ? 'border-gray-200 bg-gray-50/50' :
      'border-gray-100 bg-white'
    } p-5`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className={`font-body text-sm font-semibold leading-snug ${
              currentStatus === 'nao_aplicavel' ? 'text-gray-400' : 'text-gray-800'
            }`}>
              {item.title}
            </p>
            <span className={`font-cta text-xs px-2 py-0.5 rounded-full shrink-0 ${weightColor}`}>
              {weightLabel}
            </span>
          </div>
          <p className={`font-body text-xs leading-relaxed ${
            currentStatus === 'nao_aplicavel' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {item.description}
          </p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 font-cta text-xs font-medium text-primary hover:text-secondary transition-colors mb-3"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        Por que isso importa?
      </button>

      {expanded && (
        <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 mb-3">
          <p className="font-body text-xs text-primary/80 leading-relaxed">{item.guidance}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {RESPONSE_BUTTONS.map(btn => (
          <button
            key={btn.value}
            onClick={() => setItemResponse(item.id, btn.value)}
            className={`py-2.5 px-3 rounded-xl border font-cta text-xs font-semibold transition-all min-h-[44px] ${
              currentStatus === btn.value ? btn.activeClass : btn.inactiveClass
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {showTextField && (
        <div className="mt-3">
          <textarea
            value={currentDescription}
            onChange={e => setItemDescription(item.id, e.target.value)}
            placeholder="Descreva brevemente a situação atual (opcional)"
            maxLength={300}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 font-body text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
          />
          <p className="font-body text-xs text-gray-400 text-right mt-0.5">{currentDescription.length}/300</p>
        </div>
      )}
    </div>
  )
}
