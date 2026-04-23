// TODO: adicionar RadarChart por sócio, exportação PDF (jsPDF), ScenarioSimulator, MarketBenchmark
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useEquity } from './EquityContext'

const RADIAN = Math.PI / 180

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  )
}

function AlertCard({ alert }) {
  const colors = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info:    'bg-blue-50 border-blue-100 text-blue-800',
    success: 'bg-green-50 border-green-100 text-green-800',
  }
  return (
    <div className={`border rounded-xl px-5 py-4 mb-3 ${colors[alert.severity] || colors.info}`}>
      <p className="font-cta text-sm font-semibold mb-0.5">{alert.title}</p>
      <p className="font-body text-xs leading-relaxed">{alert.message}</p>
      {alert.recommendation && (
        <p className="font-body text-xs mt-1.5 opacity-80">{alert.recommendation}</p>
      )}
    </div>
  )
}

export default function StepResults({ onReset }) {
  const { results, partners, goToStep } = useEquity()

  if (!results || !results.result?.partners?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-heading text-lg font-bold text-bg-dark mb-2">Não foi possível carregar seu resultado</h2>
        <p className="font-body text-sm text-gray-500 mb-6">Por favor, volte e tente novamente.</p>
        <button
          onClick={() => goToStep('COMPARATIVE_REVIEW')}
          className="font-cta text-sm font-semibold text-primary hover:text-secondary transition-colors"
        >
          ← Voltar para revisão
        </button>
      </div>
    )
  }

  const { result, narrative, alerts } = results
  const chartData = result.partners.map((p, i) => ({
    name: p.name,
    value: p.percentage,
    color: partners[i]?.color || '#154efa',
  }))

  return (
    <div>
      {/* Alerts */}
      {alerts?.length > 0 && (
        <div className="mb-6">
          {alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
        </div>
      )}

      {/* Gráfico + tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="font-heading text-lg font-bold text-bg-dark mb-6">Participações sugeridas</h2>

        <div className="h-48 sm:h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                labelLine={false}
                label={PieLabel}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={v => [`${v.toFixed(2)}%`, 'Participação']}
                contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Legend
                formatter={v => <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#374151' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="divide-y divide-gray-50">
          {result.partners.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartData[i].color }} />
                <span className="font-body text-sm font-medium text-gray-800">{p.name}</span>
              </div>
              <span className="font-cta text-base font-bold text-primary">
                {p.percentage.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Narrativa */}
      {narrative?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-heading text-base font-bold text-bg-dark mb-4">Análise</h3>
          <div className="flex flex-col gap-3">
            {narrative.map((p, i) => (
              <p key={i} className="font-body text-sm text-gray-600 leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-bg-dark rounded-2xl p-6 mb-6 text-white">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Próximo passo</p>
        <h3 className="font-heading text-lg font-bold mb-2">Formalize com segurança jurídica</h3>
        <p className="font-body text-sm text-gray-400 leading-relaxed mb-5">
          A SAFIE pode estruturar o seu acordo de sócios com cláusulas de vesting, tag-along e drag-along.
        </p>
        <a
          href="https://safie.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary transition-colors px-5 py-2.5 rounded-lg"
        >
          Falar com a SAFIE
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      <button
        onClick={onReset}
        className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2"
      >
        Fazer nova simulação
      </button>
    </div>
  )
}
