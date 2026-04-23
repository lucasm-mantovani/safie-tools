const REGIME_LABELS = {
  simples: 'Simples Nacional',
  lucro_presumido: 'L. Presumido',
  lucro_real: 'Lucro Real',
}

function fmt(v) {
  return typeof v === 'number'
    ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—'
}

function pct(v) {
  return typeof v === 'number' ? `${v.toFixed(2)}%` : '—'
}

export default function RegimeComparisonTable({ results, recommendedRegime }) {
  const regimes = ['simples', 'lucro_presumido', 'lucro_real']

  const rows = [
    { label: 'Alíquota efetiva', fn: r => pct(results[r]?.effective_rate) },
    { label: 'Custo mensal', fn: r => fmt(results[r]?.total_monthly) },
    { label: 'Custo anual', fn: r => fmt(results[r]?.annual_total) },
    { label: 'IRPJ', fn: r => fmt(results[r]?.breakdown?.irpj) },
    { label: 'CSLL', fn: r => fmt(results[r]?.breakdown?.csll) },
    { label: 'PIS', fn: r => fmt(results[r]?.breakdown?.pis) },
    { label: 'COFINS', fn: r => fmt(results[r]?.breakdown?.cofins) },
    { label: 'ISS / ICMS', fn: r => fmt(results[r]?.breakdown?.iss ?? results[r]?.breakdown?.icms) },
    { label: 'DAS', fn: r => r === 'simples' ? fmt(results[r]?.monthly_das) : '—' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 overflow-x-auto">
      <h3 className="font-heading text-base font-bold text-bg-dark mb-4">Comparativo detalhado</h3>
      <table className="w-full text-sm min-w-[400px]">
        <thead>
          <tr>
            <th className="text-left font-cta text-xs text-gray-400 uppercase tracking-wide pb-3 pr-4 w-1/3">Tributo</th>
            {regimes.map(r => (
              <th
                key={r}
                className={`text-right font-cta text-xs uppercase tracking-wide pb-3 px-2 ${
                  r === recommendedRegime ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {REGIME_LABELS[r]}
                {r === recommendedRegime && <span className="ml-1">★</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50/60' : ''}>
              <td className="py-2 pr-4 font-body text-xs text-gray-600 rounded-l-lg">{row.label}</td>
              {regimes.map(r => (
                <td
                  key={r}
                  className={`py-2 px-2 text-right font-body text-xs rounded-r-lg ${
                    r === recommendedRegime ? 'font-semibold text-primary' : 'text-gray-700'
                  }`}
                >
                  {row.fn(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {results.simples && !results.simples.eligible && (
        <p className="font-body text-xs text-amber-600 mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          A receita atual pode ultrapassar o limite do Simples Nacional (R$ 4,8M/ano). Verifique com seu contador.
        </p>
      )}
    </div>
  )
}
