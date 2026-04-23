const ANEXO_III = [[180000,.06,0],[360000,.112,9360],[720000,.135,17640],[1800000,.16,35640],[3600000,.21,125640],[4800000,.33,648000]]

export function generateLevers(input, results) {
  const { company_profile, revenue_data, cost_structure = {}, partner_remuneration = {}, supplementary_data = {} } = input
  const { monthly_revenue, services_revenue_pct = 100 } = revenue_data
  const { activity_type } = company_profile
  const { payroll = 0, documented_supplier_costs = 0, rent = 0, other_documented_costs = 0 } = cost_structure
  const { total_prolabore = 0, total_profit_distribution = 0, partners = [] } = partner_remuneration
  const { has_rd_investment = false, rd_investment = 0 } = supplementary_data
  const { recommended_regime, simples } = results

  const levers = []

  // Otimização de pró-labore
  if (total_prolabore > monthly_revenue * 0.15) {
    const recommended = 1412 * Math.max(partners.length, 1) * 2
    const savings = Math.max(0, (total_prolabore - recommended) * 0.31)
    if (savings > 0) levers.push({
      key: 'prolabore_optimization',
      title: 'Otimização do Pró-labore',
      description: 'Reduzir o pró-labore ao mínimo e distribuir o restante como dividendos (isentos de IR) gera economia em INSS e IRPF.',
      monthly_savings: savings,
      annual_savings: savings * 12,
      complexity: 'baixa',
    })
  }

  // Fator R — migração Anexo V → III
  if (simples?.eligible && simples?.anexo_applied === 'V') {
    const fr = simples.fator_r || 0
    if (fr >= 0.20 && fr < 0.28) {
      const rbt12 = monthly_revenue * 12
      const band = ANEXO_III.find(([lim]) => rbt12 <= lim)
      const iii_rate = band ? (rbt12 * band[1] - band[2]) / rbt12 : 0
      const rate_diff = Math.max(0, simples.effective_rate - iii_rate)
      const monthly_savings = monthly_revenue * rate_diff
      levers.push({
        key: 'fator_r',
        title: 'Migração pelo Fator R (Anexo V → III)',
        description: `Aumentando a folha em R$ ${((monthly_revenue * 0.28 - payroll)).toFixed(0)}/mês você atinge Fator R ≥ 28% e migra para o Anexo III, com alíquota menor.`,
        monthly_savings,
        annual_savings: monthly_savings * 12,
        additional_payroll_needed: monthly_revenue * 0.28 - payroll,
        complexity: 'media',
      })
    }
  }

  // Créditos de PIS/COFINS (Lucro Real)
  const documented_costs = documented_supplier_costs + rent + other_documented_costs
  if (recommended_regime === 'lucro_real' && documented_costs > monthly_revenue * 0.3) {
    const monthly_savings = documented_costs * (0.0165 + 0.076)
    levers.push({
      key: 'pis_cofins_credits',
      title: 'Créditos de PIS/COFINS (Regime Não-Cumulativo)',
      description: 'No Lucro Real seus custos documentados geram créditos de PIS (1,65%) e COFINS (7,6%) que reduzem a carga diretamente.',
      monthly_savings,
      annual_savings: monthly_savings * 12,
      complexity: 'alta',
    })
  }

  // Distribuição de lucros
  if (total_profit_distribution === 0 && (recommended_regime === 'lucro_presumido' || recommended_regime === 'lucro_real')) {
    const distributable = monthly_revenue * 0.15
    const monthly_savings = distributable * 0.15
    levers.push({
      key: 'profit_distribution',
      title: 'Distribuição de Lucros',
      description: 'Dividendos são isentos de IRPF. Estruturar remuneração com distribuição de lucros reduz INSS e IR dos sócios.',
      monthly_savings,
      annual_savings: monthly_savings * 12,
      complexity: 'baixa',
    })
  }

  // Lei do Bem
  if (has_rd_investment && rd_investment > 0 && recommended_regime === 'lucro_real') {
    const monthly_savings = rd_investment * 0.6 * 0.15
    levers.push({
      key: 'lei_do_bem',
      title: 'Lei do Bem — Dedução P&D',
      description: 'Empresas em Lucro Real com P&D podem deduzir 60% adicionais dos gastos de pesquisa da base do IRPJ.',
      monthly_savings,
      annual_savings: monthly_savings * 12,
      complexity: 'alta',
    })
  }

  // Alerta: limite do Simples
  if (simples?.eligible && monthly_revenue * 12 > 4800000 * 0.85) {
    levers.push({
      key: 'simples_limit_warning',
      title: 'Atenção: Próximo do Limite do Simples',
      description: 'Sua receita está próxima do teto de R$ 4,8M/ano. Planeje a migração de regime com antecedência.',
      monthly_savings: 0,
      annual_savings: 0,
      type: 'warning',
      complexity: 'alta',
    })
  }

  return levers.sort((a, b) => b.annual_savings - a.annual_savings)
}
