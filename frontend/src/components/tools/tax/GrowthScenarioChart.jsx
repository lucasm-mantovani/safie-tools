import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const REGIME_COLORS = {
  simples: '#154efa',
  lucro_presumido: '#f59e0b',
  lucro_real: '#10b981',
}

const REGIME_LABELS = {
  simples: 'Simples',
  lucro_presumido: 'L. Presumido',
  lucro_real: 'L. Real',
}

export default function GrowthScenarioChart({ growthScenarios }) {
  const [hoverIdx, setHoverIdx] = useState(null)

  if (!growthScenarios?.length) return null

  const chartData = growthScenarios.map(s => ({
    revenue: `R$ ${(s.monthly_revenue / 1000).toFixed(0)}k`,
    simples: parseFloat(s.ctet?.simples?.toFixed(2)),
    lucro_presumido: parseFloat(s.ctet?.lucro_presumido?.toFixed(2)),
    lucro_real: parseFloat(s.ctet?.lucro_real?.toFixed(2)),
    simples_eligible: s.simples_eligible,
    monthly_revenue: s.monthly_revenue,
  }))

  const current = hoverIdx !== null ? growthScenarios[hoverIdx] : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
      <h3 className="font-heading text-base font-bold text-bg-dark mb-1">Projeção por crescimento de receita</h3>
      <p className="font-body text-xs text-gray-400 mb-5">
        CTET % — Carga Tributária Efetiva Total como % da receita
      </p>

      <div className="h-56 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
            onMouseMove={e => e.activeTooltipIndex != null && setHoverIdx(e.activeTooltipIndex)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="revenue"
              tick={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fill: '#9ca3af' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={v => `${v}%`}
              tick={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fill: '#9ca3af' }}
            />
            <Tooltip
              formatter={(v, name) => [`${v?.toFixed(2)}%`, REGIME_LABELS[name] || name]}
              contentStyle={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
              }}
            />
            <Legend
              formatter={v => (
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#374151' }}>
                  {REGIME_LABELS[v] || v}
                </span>
              )}
            />
            {Object.entries(REGIME_COLORS).map(([key, color]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {current && !current.simples_eligible && (
        <p className="font-body text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          Neste patamar (R$ {current.monthly_revenue.toLocaleString('pt-BR')}/mês), a empresa excede o limite do Simples Nacional.
        </p>
      )}
    </div>
  )
}
