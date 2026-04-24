import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'

const CATEGORY_SHORT_LABELS = {
  corporate: 'Societário',
  legal: 'Jurídico',
  financial: 'Financeiro',
  product: 'Produto',
  hr: 'Pessoas',
  commercial: 'Comercial',
  captacao_specific: 'Captação',
  ma_specific: 'M&A',
}

export default function CategoryRadarChart({ diagnostic, onCategoryClick }) {
  const { category_scores, category_order } = diagnostic

  const data = (category_order || []).map(catId => ({
    category: CATEGORY_SHORT_LABELS[catId] || catId,
    catId,
    score: category_scores?.[catId] ?? 0,
    threshold: 80,
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-heading text-base font-bold text-bg-dark mb-4">Score por categoria</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#6b7280' }}
            onClick={d => onCategoryClick && onCategoryClick(d.catId)}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickCount={5}
          />
          <Radar
            name="Threshold"
            dataKey="threshold"
            stroke="#154EFA20"
            fill="#154EFA08"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#154EFA"
            fill="#154EFA"
            fillOpacity={0.18}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Prontidão']}
            contentStyle={{ fontSize: 12, fontFamily: 'Inter', borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <p className="font-body text-xs text-gray-400 text-center mt-2">
        Linha tracejada = meta de 80% por categoria
      </p>
    </div>
  )
}
