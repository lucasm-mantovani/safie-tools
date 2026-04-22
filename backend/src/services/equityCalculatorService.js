const ROLE_SCORES = {
  founder: 1.0, ceo: 0.9, cto: 0.85, coo: 0.8, cmo: 0.75,
  vp: 0.7, manager: 0.6, specialist: 0.5, other: 0.4,
}
const OPPORTUNITY_MAP = { no_sacrifice: 0, partial: 0.5, significant: 1.0, full_salary_sacrificed: 1.5 }
const VESTING_MAP = { yes: 1.0, negotiable: 0.5, no: 0.0 }
const EXCLUSIVITY_MAP = { exclusive: 1.0, partial: 0.6, non_exclusive: 0.2 }
const CRITICALITY_MAP = { critical: 1.5, important: 1.2, helpful: 1.0 }

function toRaw(ev) {
  const { capital: c, work: w, knowledge: k, risk: r } = ev
  return {
    capital: {
      financial_investment: c.financial_investment || 0,
      non_financial_assets: c.non_financial_assets || 0,
      financial_guarantees: c.financial_guarantees || 0,
    },
    work: {
      weekly_hours: (w.weekly_hours || 0) / 44,
      role_seniority:
        (ROLE_SCORES[w.role_type] || 0.4) * 0.6 +
        (Math.min(w.years_experience || 0, 20) / 20) * 0.4,
      pre_company_dedication:
        (w.pre_company_dedication_months || 0) *
        (w.pre_company_dedication_intensity === 'partial' ? 0.5 : 1.0),
    },
    knowledge: {
      intellectual_property:
        (k.intellectual_property || 0) * (CRITICALITY_MAP[k.ip_criticality] || 1.0),
      network_and_market_access: k.network_and_market_access || 0,
      technical_expertise:
        (k.technical_expertise || 0) * (CRITICALITY_MAP[k.tech_criticality] || 1.0),
    },
    risk: {
      opportunity_cost: OPPORTUNITY_MAP[r.opportunity_cost] ?? 0,
      vesting_acceptance: VESTING_MAP[r.vesting_acceptance] ?? 0,
      exclusivity: EXCLUSIVITY_MAP[r.exclusivity] ?? 0.2,
    },
  }
}

function normalize(allRaw, dim) {
  const keys = Object.keys(allRaw[0][dim])
  const maxes = Object.fromEntries(
    keys.map(k => [k, Math.max(...allRaw.map(s => s[dim][k]))])
  )
  return allRaw.map(raw =>
    Object.fromEntries(keys.map(k => [k, maxes[k] > 0 ? raw[dim][k] / maxes[k] : 0]))
  )
}

export function calculate(partners, evaluations, dimensionWeights) {
  const dims = ['capital', 'work', 'knowledge', 'risk']
  const allRaw = evaluations.map(toRaw)
  const norm = Object.fromEntries(dims.map(d => [d, normalize(allRaw, d)]))

  const totals = partners.map((_, i) =>
    dims.reduce((total, dim) => {
      const scores = norm[dim][i]
      const n = Object.keys(scores).length
      const dimScore = Object.values(scores).reduce((s, v) => s + v / n, 0)
      return total + dimScore * (dimensionWeights[dim] / 100)
    }, 0)
  )

  const sumTotal = totals.reduce((a, b) => a + b, 0)

  return partners.map((partner, i) => ({
    name: partner.name,
    percentage: sumTotal > 0
      ? Math.round((totals[i] / sumTotal) * 10000) / 100
      : Math.round(10000 / partners.length) / 100,
    dimension_scores: Object.fromEntries(
      dims.map(dim => {
        const scores = norm[dim][i]
        const n = Object.keys(scores).length
        return [dim, Math.round(Object.values(scores).reduce((s, v) => s + v / n, 0) * 100)]
      })
    ),
    criteria_scores: Object.fromEntries(dims.map(dim => [dim, { ...norm[dim][i] }])),
  }))
}
