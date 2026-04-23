import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculateSimples, calculateLucroPresumido, calculateLucroReal } from '../services/taxCalculatorService.js'

// Test 1: Software company R$50k/month, no payroll → Anexo V
test('Simples: serviços sem folha usa Anexo V com alíquota entre 15,5% e 18%', () => {
  const r = calculateSimples({ monthly_revenue: 50000, activity_type: 'servicos', payroll: 0 })
  assert.equal(r.eligible, true)
  assert.equal(r.anexo_applied, 'V')
  assert.ok(r.effective_rate >= 0.155 && r.effective_rate <= 0.18, `Alíquota esperada 15,5%–18%, obtida: ${(r.effective_rate * 100).toFixed(2)}%`)
})

// Test 2: Software company R$50k/month, R$15k payroll → Fator R=0,36 → Anexo III
test('Simples: serviços com folha R$15k (Fator R=0,36) usa Anexo III', () => {
  const r = calculateSimples({ monthly_revenue: 50000, activity_type: 'servicos', payroll: 15000 })
  assert.equal(r.eligible, true)
  const expected_fr = (15000 * 12) / (50000 * 12)
  assert.ok(Math.abs(r.fator_r - expected_fr) < 0.001, `Fator R esperado ${expected_fr}, obtido ${r.fator_r}`)
  assert.equal(r.anexo_applied, 'III')
  assert.ok(r.effective_rate >= 0.06 && r.effective_rate <= 0.112, `Alíquota esperada 6%–11,2%, obtida: ${(r.effective_rate * 100).toFixed(2)}%`)
})

// Test 3: Serviços R$200k/mês → LP usa 32% de presunção
test('Lucro Presumido: serviços R$200k usa presunção de 32%', () => {
  const r = calculateLucroPresumido({ monthly_revenue: 200000, activity_type: 'servicos', payroll: 0, services_revenue_pct: 100 })
  assert.equal(r.presumption_rate, 0.32)
  assert.ok(r.total_monthly > 0)
})

// Test 4: Comércio R$100k/mês → Simples Anexo I + LP presunção 8%
test('Comércio R$100k: Simples Anexo I e LP presunção 8%', () => {
  const s = calculateSimples({ monthly_revenue: 100000, activity_type: 'produtos', payroll: 0 })
  assert.equal(s.eligible, true)
  assert.equal(s.anexo_applied, 'I')

  const lp = calculateLucroPresumido({ monthly_revenue: 100000, activity_type: 'produtos', payroll: 0, services_revenue_pct: 0 })
  assert.equal(lp.presumption_rate, 0.08)
})

// Test 5: Lucro Real — R$80k custos documentados sobre R$200k faturamento gera créditos PIS/COFINS
test('Lucro Real: R$80k custos geram créditos PIS/COFINS e IRPJ calculado sobre lucro líquido', () => {
  const r = calculateLucroReal({
    monthly_revenue: 200000,
    activity_type: 'servicos',
    payroll: 0,
    documented_supplier_costs: 80000,
    rent: 0,
    other_documented_costs: 0,
    services_revenue_pct: 100,
  })
  const expected_credits = 80000 * (0.0165 + 0.076)
  assert.ok(Math.abs(r.pis_cofins_credits - expected_credits) < 1, `Créditos esperados: ${expected_credits}, obtidos: ${r.pis_cofins_credits}`)

  const expected_profit = 200000 - 80000
  assert.ok(Math.abs(r.estimated_profit - expected_profit) < 1)

  const expected_irpj = expected_profit * 0.15
  assert.ok(Math.abs(r.breakdown.irpj - expected_irpj) < 1, `IRPJ esperado: ${expected_irpj}, obtido: ${r.breakdown.irpj}`)
})
