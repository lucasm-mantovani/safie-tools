const ANEXO_I   = [[180000,.04,0],[360000,.073,5940],[720000,.095,13860],[1800000,.107,22500],[3600000,.143,87300],[4800000,.19,378000]]
const ANEXO_III = [[180000,.06,0],[360000,.112,9360],[720000,.135,17640],[1800000,.16,35640],[3600000,.21,125640],[4800000,.33,648000]]
const ANEXO_V   = [[180000,.155,0],[360000,.18,4500],[720000,.195,9900],[1800000,.205,17100],[3600000,.23,62100],[4800000,.305,540000]]

function simplesBand(rbt12, table) {
  for (const [limit, rate, ded] of table) if (rbt12 <= limit) return { rate, ded }
  return null
}

export function calculateSimples({ monthly_revenue, payroll = 0, activity_type }) {
  const rbt12 = monthly_revenue * 12
  if (rbt12 > 4800000) return { eligible: false, reason: 'Acima do limite do Simples (R$ 4,8M/ano)' }

  let anexo, fator_r = null
  if (activity_type === 'produtos') {
    anexo = 'I'
  } else {
    fator_r = payroll > 0 ? (payroll * 12) / rbt12 : 0
    anexo = fator_r >= 0.28 ? 'III' : 'V'
  }

  const table = anexo === 'I' ? ANEXO_I : anexo === 'III' ? ANEXO_III : ANEXO_V
  const band = simplesBand(rbt12, table)
  if (!band) return { eligible: false, reason: 'Fora das faixas do Simples' }

  const effective_rate = (rbt12 * band.rate - band.ded) / rbt12
  const monthly_das = monthly_revenue * effective_rate
  const fgts = payroll * 0.08

  return {
    eligible: true,
    anexo_applied: anexo,
    fator_r,
    effective_rate,
    monthly_das,
    fgts,
    total_monthly: monthly_das + fgts,
    annual_total: (monthly_das + fgts) * 12,
    breakdown: { das: monthly_das, fgts },
  }
}

export function calculateLucroPresumido({ monthly_revenue, payroll = 0, activity_type, services_revenue_pct = 100, iss_rate = 0.05 }) {
  const svc = monthly_revenue * (services_revenue_pct / 100)
  const prd = monthly_revenue - svc
  const pre_irpj = activity_type === 'servicos' ? 0.32 : activity_type === 'produtos' ? 0.08 : (svc * 0.32 + prd * 0.08) / monthly_revenue
  const pre_csll = activity_type === 'servicos' ? 0.32 : activity_type === 'produtos' ? 0.12 : (svc * 0.32 + prd * 0.12) / monthly_revenue

  const irpj_base = monthly_revenue * pre_irpj
  const irpj = irpj_base * 0.15
  const irpj_adicional = Math.max(0, irpj_base - 20000) * 0.10
  const csll = monthly_revenue * pre_csll * 0.09
  const pis = monthly_revenue * 0.0065
  const cofins = monthly_revenue * 0.03
  const iss = svc * iss_rate
  const cpp = payroll * 0.268
  const fgts = payroll * 0.08

  const total_monthly = irpj + irpj_adicional + csll + pis + cofins + iss + cpp + fgts
  return {
    effective_rate: total_monthly / monthly_revenue,
    total_monthly,
    annual_total: total_monthly * 12,
    presumption_rate: pre_irpj,
    breakdown: { irpj, irpj_adicional, csll, pis, cofins, iss, cpp, fgts },
  }
}

export function calculateLucroReal({ monthly_revenue, payroll = 0, activity_type, services_revenue_pct = 100, iss_rate = 0.05, documented_supplier_costs = 0, rent = 0, other_documented_costs = 0 }) {
  const svc = monthly_revenue * (services_revenue_pct / 100)
  const documented_costs = payroll + documented_supplier_costs + rent + other_documented_costs

  const pis_credits = documented_costs * 0.0165
  const cofins_credits = documented_costs * 0.076
  const pis = Math.max(0, monthly_revenue * 0.0165 - pis_credits)
  const cofins = Math.max(0, monthly_revenue * 0.076 - cofins_credits)

  const estimated_profit = monthly_revenue - documented_costs
  const irpj = Math.max(0, estimated_profit) * 0.15
  const irpj_adicional = Math.max(0, estimated_profit - 20000) * 0.10
  const csll = Math.max(0, estimated_profit) * 0.09
  const iss = svc * iss_rate
  const cpp = payroll * 0.268
  const fgts = payroll * 0.08

  const total_monthly = irpj + irpj_adicional + csll + pis + cofins + iss + cpp + fgts
  return {
    effective_rate: total_monthly / monthly_revenue,
    total_monthly,
    annual_total: total_monthly * 12,
    estimated_profit,
    pis_cofins_credits: pis_credits + cofins_credits,
    breakdown: { irpj, irpj_adicional, csll, pis, cofins, iss, cpp, fgts },
  }
}

export function calculateCTET(total_taxes, monthly_revenue) {
  return monthly_revenue > 0 ? (total_taxes / monthly_revenue) * 100 : 0
}

export function calculateCTEL(total_taxes, estimated_profit) {
  return estimated_profit > 0 ? (total_taxes / estimated_profit) * 100 : null
}

export function generateGrowthScenarios(data, multipliers = [1.0, 1.5, 2.0]) {
  const { monthly_revenue } = data
  const limit_mult = Math.min((4800000 / 12) / monthly_revenue, 5.0)
  const all = [...new Set([...multipliers, Math.round(limit_mult * 10) / 10])].sort((a, b) => a - b)

  return all.map(m => {
    const d = { ...data, monthly_revenue: monthly_revenue * m }
    const s = calculateSimples(d)
    const lp = calculateLucroPresumido(d)
    const lr = calculateLucroReal(d)
    return {
      multiplier: m,
      monthly_revenue: d.monthly_revenue,
      ctet: {
        simples: s.eligible ? calculateCTET(s.total_monthly, d.monthly_revenue) : null,
        lucro_presumido: calculateCTET(lp.total_monthly, d.monthly_revenue),
        lucro_real: calculateCTET(lr.total_monthly, d.monthly_revenue),
      },
      simples_eligible: s.eligible,
      at_simples_limit: m >= limit_mult * 0.95,
    }
  })
}

export function runFullCalculation(data) {
  const simples = calculateSimples(data)
  const lp = calculateLucroPresumido(data)
  const lr = calculateLucroReal(data)

  const candidates = [
    { regime: 'simples', total: simples.eligible ? simples.total_monthly : Infinity },
    { regime: 'lucro_presumido', total: lp.total_monthly },
    { regime: 'lucro_real', total: lr.total_monthly },
  ].sort((a, b) => a.total - b.total)

  const recommended_regime = candidates[0].regime
  const current = { simples: simples.total_monthly, lucro_presumido: lp.total_monthly, lucro_real: lr.total_monthly }[data.current_regime] || lp.total_monthly
  const annual_savings_potential = Math.max(0, (current - candidates[0].total) * 12)

  return {
    simples,
    lucro_presumido: lp,
    lucro_real: lr,
    recommended_regime,
    annual_savings_potential,
    ctet: {
      simples: simples.eligible ? calculateCTET(simples.total_monthly, data.monthly_revenue) : null,
      lucro_presumido: calculateCTET(lp.total_monthly, data.monthly_revenue),
      lucro_real: calculateCTET(lr.total_monthly, data.monthly_revenue),
    },
    ctel: { lucro_real: lr.estimated_profit > 0 ? calculateCTEL(lr.total_monthly, lr.estimated_profit) : null },
    growth_scenarios: generateGrowthScenarios(data),
    ranking: candidates.filter(c => c.total !== Infinity).map((c, i) => ({ regime: c.regime, rank: i + 1, total_monthly: c.total })),
  }
}
