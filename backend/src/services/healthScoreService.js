export function calculateHealthScore(input, results) {
  const { company_profile = {}, revenue_data = {}, cost_structure = {}, partner_remuneration = {}, qualification_data = {} } = input
  const { recommended_regime, annual_savings_potential, ctet } = results
  const { current_regime } = company_profile
  const { has_accountant, last_regime_review } = qualification_data
  const monthly_revenue = revenue_data.monthly_revenue || 1

  const criteria = []
  let total = 0

  // 1. Otimização de regime (0–30)
  const is_optimal = current_regime === recommended_regime
  const current_ctet = ctet[current_regime] ?? ctet.lucro_presumido ?? 0
  const rec_ctet = ctet[recommended_regime] ?? 0
  const savings_pct = current_ctet > 0 ? (current_ctet - rec_ctet) / current_ctet : 0
  const regime_score = is_optimal ? 30 : savings_pct < 0.05 ? 22 : savings_pct < 0.15 ? 12 : 4
  criteria.push({ key: 'regime', label: 'Regime tributário', score: regime_score, max: 30 })
  total += regime_score

  // 2. Carga tributária absoluta (0–20)
  const burden_score = rec_ctet < 15 ? 20 : rec_ctet < 20 ? 15 : rec_ctet < 25 ? 8 : 4
  criteria.push({ key: 'burden', label: 'Carga tributária efetiva', score: burden_score, max: 20 })
  total += burden_score

  // 3. Estrutura de remuneração (0–20)
  const { total_prolabore = 0, total_profit_distribution = 0 } = partner_remuneration
  const has_dist = total_profit_distribution > 0
  const pl_ratio = total_prolabore / monthly_revenue
  const rem_score = has_dist && pl_ratio < 0.3 ? 20 : has_dist ? 13 : pl_ratio < 0.15 ? 8 : 3
  criteria.push({ key: 'remuneration', label: 'Estrutura de remuneração', score: rem_score, max: 20 })
  total += rem_score

  // 4. Documentação de custos (0–15)
  const { documented_supplier_costs = 0, rent = 0 } = cost_structure
  const doc_ratio = (documented_supplier_costs + rent) / monthly_revenue
  const doc_score = doc_ratio > 0.4 ? 15 : doc_ratio > 0.2 ? 10 : doc_ratio > 0.05 ? 6 : 2
  criteria.push({ key: 'documentation', label: 'Documentação de custos', score: doc_score, max: 15 })
  total += doc_score

  // 5. Assessoria profissional (0–15)
  const adv_score = has_accountant === 'sim' && last_regime_review === 'menos_1_ano' ? 15
    : has_accountant === 'sim' ? 10
    : has_accountant === 'insatisfeito' ? 5
    : 0
  criteria.push({ key: 'advisory', label: 'Assessoria contábil', score: adv_score, max: 15 })
  total += adv_score

  const alerts = []
  if (!is_optimal && annual_savings_potential > 12000)
    alerts.push({ type: 'critical', message: `Economia potencial de R$ ${(annual_savings_potential / 12).toFixed(0)}/mês migrando para ${recommended_regime.replace('_', ' ')}` })
  if (has_accountant === 'nao')
    alerts.push({ type: 'warning', message: 'Sem contador, o risco de erro fiscal e multa aumenta significativamente.' })
  if (last_regime_review === 'nunca' || last_regime_review === 'mais_2_anos')
    alerts.push({ type: 'info', message: 'Regime não revisado há muito tempo. O cenário da empresa pode ter mudado.' })

  const grade = total >= 80 ? 'A' : total >= 60 ? 'B' : total >= 40 ? 'C' : 'D'
  return { score: total, max: 100, grade, criteria, alerts }
}
