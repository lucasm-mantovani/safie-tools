const CLASSIFICATION_STYLES = {
  green: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: '#10b981', label: 'Pronto para iniciar o processo' },
  yellow: { bg: 'bg-amber-100', text: 'text-amber-700', ring: '#f59e0b', label: 'Requer ajustes antes de iniciar' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', ring: '#f97316', label: 'Requer preparação significativa' },
  red: { bg: 'bg-red-100', text: 'text-red-700', ring: '#ef4444', label: 'Não recomendado iniciar no momento' },
}

function CircularProgress({ pct, color }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={r} fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

export default function ReadinessScoreCard({ diagnostic }) {
  const { overall_readiness, deal_readiness_classification, timeline_estimate, red_flags, yellow_flags, recommendations } = diagnostic
  const style = CLASSIFICATION_STYLES[deal_readiness_classification?.color || 'red']

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <CircularProgress pct={overall_readiness} color={style.ring} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-3xl font-bold text-bg-dark">{overall_readiness}%</span>
            <span className="font-body text-xs text-gray-500">prontidão</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className={`inline-block px-3 py-1 rounded-full font-cta text-xs font-semibold mb-3 ${style.bg} ${style.text}`}>
            {deal_readiness_classification?.label}
          </span>
          <p className="font-body text-sm text-gray-600 mb-4">{timeline_estimate?.narrative}</p>
          {(timeline_estimate?.min_weeks || 0) > 0 && (
            <p className="font-cta text-sm font-semibold text-bg-dark">
              Estimativa: {timeline_estimate.min_weeks} a {timeline_estimate.max_weeks} semanas de preparação
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="font-heading text-2xl font-bold text-red-600">{red_flags?.length || 0}</p>
          <p className="font-body text-xs text-red-700 mt-0.5">Red Flags</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <p className="font-heading text-2xl font-bold text-amber-600">{yellow_flags?.length || 0}</p>
          <p className="font-body text-xs text-amber-700 mt-0.5">Yellow Flags</p>
        </div>
        <div className="bg-primary/5 rounded-xl p-3 text-center">
          <p className="font-heading text-2xl font-bold text-primary">{recommendations?.length || 0}</p>
          <p className="font-body text-xs text-primary/80 mt-0.5">Recomendações</p>
        </div>
      </div>
    </div>
  )
}
