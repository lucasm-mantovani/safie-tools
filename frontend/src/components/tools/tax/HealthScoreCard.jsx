function getColorConfig(score, max) {
  const pct = max > 0 ? (score / max) * 100 : 0
  if (pct >= 70) return { ring: '#10b981', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', label: 'Saudável' }
  if (pct >= 40) return { ring: '#f59e0b', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Atenção' }
  return { ring: '#ef4444', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'Crítico' }
}

function CircularProgress({ score, max, grade, colors }) {
  const radius = 42
  const circ = 2 * Math.PI * radius
  const pct = max > 0 ? (score / max) * 100 : 0
  const dash = (pct / 100) * circ

  return (
    <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 55 55)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-heading text-2xl font-bold leading-none ${colors.text}`}>{score}</span>
        <span className="font-cta text-xs text-gray-400">de {max}</span>
        {grade && <span className={`font-cta text-xs font-bold mt-0.5 ${colors.text}`}>{grade}</span>}
      </div>
    </div>
  )
}

export default function HealthScoreCard({ healthScore }) {
  if (!healthScore) return null
  const { score, max, grade, criteria, alerts } = healthScore
  const colors = getColorConfig(score, max)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4">
      <h3 className="font-heading text-base font-bold text-bg-dark mb-4">Health Score Tributário</h3>

      <div className="flex items-center gap-3 sm:gap-5 mb-5">
        <CircularProgress score={score} max={max} grade={grade} colors={colors} />
        <div>
          <div className={`inline-flex px-3 py-1 rounded-full font-cta text-xs font-semibold border ${colors.bg} ${colors.border} ${colors.text} mb-2`}>
            {colors.label}
          </div>
          <p className="font-body text-sm text-gray-600 leading-relaxed">
            Avaliação da saúde tributária com base em {criteria?.length || 5} critérios objetivos.
          </p>
        </div>
      </div>

      {criteria?.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          {criteria.map(c => {
            const cc = getColorConfig(c.score, c.max)
            const cpct = c.max > 0 ? (c.score / c.max) * 100 : 0
            return (
              <div key={c.key} className="flex items-center gap-3">
                <p className="font-body text-xs text-gray-600 w-28 sm:w-36 shrink-0 leading-tight">{c.label}</p>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${cpct}%`, backgroundColor: cc.ring }}
                  />
                </div>
                <span className={`font-cta text-xs font-semibold w-10 text-right ${cc.text}`}>
                  {c.score}/{c.max}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {alerts?.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 border ${
                a.type === 'warning'
                  ? 'bg-amber-50 border-amber-100 text-amber-700'
                  : 'bg-blue-50 border-blue-100 text-blue-700'
              }`}
            >
              <p className="font-body text-xs leading-relaxed">{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
