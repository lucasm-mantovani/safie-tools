const REGIME_LABELS = {
  simples: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

export default function VerdictCard({ results }) {
  const { recommended_regime, annual_savings_potential, ranking } = results
  const isAlreadyBest = ranking?.[0]?.regime === recommended_regime

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
      <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Regime Recomendado</p>
      <h2 className="font-heading text-2xl font-bold text-bg-dark mb-4">
        {REGIME_LABELS[recommended_regime] || recommended_regime}
      </h2>

      {annual_savings_potential > 0 ? (
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">
          <p className="font-cta text-xs text-gray-400 mb-1">Economia anual estimada</p>
          <p className="font-heading text-2xl font-bold text-green-600">
            {annual_savings_potential.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">
          <p className="font-body text-sm text-green-700 font-medium">Sua empresa já está no regime mais vantajoso.</p>
        </div>
      )}

      {ranking?.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <p className="font-cta text-xs text-gray-400 uppercase tracking-wide mb-3">Custo tributário mensal por regime</p>
          {ranking.map((r, i) => (
            <div
              key={r.regime}
              className={`flex items-center justify-between py-2.5 ${i < ranking.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {i + 1}
                </span>
                <span className={`font-body text-sm ${
                  r.regime === recommended_regime ? 'font-semibold text-primary' : 'text-gray-700'
                }`}>
                  {REGIME_LABELS[r.regime] || r.regime}
                </span>
                {r.regime === recommended_regime && (
                  <span className="font-cta text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Recomendado</span>
                )}
              </div>
              <span className="font-cta text-sm font-bold text-gray-800">
                {r.total_monthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
