import { useTax } from './TaxContext'
import { generatePdfFromData } from '../../../utils/pdfGenerator'
import VerdictCard from '../../../components/tools/tax/VerdictCard'
import RegimeComparisonTable from '../../../components/tools/tax/RegimeComparisonTable'
import GrowthScenarioChart from '../../../components/tools/tax/GrowthScenarioChart'
import TaxLeverList from '../../../components/tools/tax/TaxLeverList'
import HealthScoreCard from '../../../components/tools/tax/HealthScoreCard'
import ContextualCTA from '../../../components/tools/tax/ContextualCTA'

const REGIME_LABELS = {
  simples: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

export default function StepResults({ onReset }) {
  const { results, qualificationData, goToStep } = useTax()

  if (!results || !results.results?.recommended_regime) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="font-body text-sm text-gray-500 mb-4">
          Não foi possível carregar o resultado do diagnóstico.
        </p>
        <button
          onClick={() => goToStep('SUPPLEMENTARY')}
          className="font-cta text-sm text-primary hover:underline"
        >
          Voltar
        </button>
      </div>
    )
  }

  const { results: regimeResults, levers, health_score } = results
  const { recommended_regime, annual_savings_potential, growth_scenarios, ranking } = regimeResults

  function handleUserPDF() {
    generatePdfFromData({
      title: 'Tax Better — Diagnóstico Tributário',
      fileName: 'diagnostico-tributario-safie',
      sections: [
        { label: 'Regime Recomendado', value: REGIME_LABELS[recommended_regime] || recommended_regime },
        {
          label: 'Economia Anual Estimada',
          value: annual_savings_potential > 0
            ? annual_savings_potential.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'Regime já otimizado',
        },
        {
          label: 'Health Score',
          value: health_score ? `${health_score.score}/${health_score.max} (${health_score.grade})` : '—',
        },
        ...(levers?.slice(0, 5).map(l => ({
          label: `Alavanca: ${l.title}`,
          value: `Economia anual: ${l.annual_savings?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} — ${l.description}`,
        })) || []),
        ...(ranking?.map((r, i) => ({
          label: `${i + 1}º Regime`,
          value: `${REGIME_LABELS[r.regime] || r.regime}: ${r.total_monthly?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês`,
        })) || []),
      ],
    })
  }

  function handleAccountantPDF() {
    const regimes = ['simples', 'lucro_presumido', 'lucro_real']
    const sections = [
      { label: 'Regime Recomendado', value: REGIME_LABELS[recommended_regime] || recommended_regime },
      {
        label: 'Economia Anual Estimada',
        value: annual_savings_potential > 0
          ? annual_savings_potential.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          : 'Regime já otimizado',
      },
      { label: '---', value: 'DETALHAMENTO POR REGIME' },
    ]

    regimes.forEach(r => {
      const d = regimeResults[r]
      if (!d) return
      sections.push(
        { label: `[${REGIME_LABELS[r]}] Alíquota Efetiva`, value: d.effective_rate ? `${d.effective_rate.toFixed(2)}%` : '—' },
        { label: `[${REGIME_LABELS[r]}] Custo Mensal`, value: d.total_monthly ? d.total_monthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—' },
        { label: `[${REGIME_LABELS[r]}] Custo Anual`, value: d.annual_total ? d.annual_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—' },
      )
      if (d.breakdown) {
        Object.entries(d.breakdown).forEach(([k, v]) => {
          if (typeof v === 'number') {
            sections.push({ label: `  ${k.toUpperCase()}`, value: v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) })
          }
        })
      }
    })

    if (levers?.length) {
      sections.push({ label: '---', value: 'ALAVANCAS TRIBUTÁRIAS' })
      levers.forEach(l => {
        sections.push({
          label: l.title,
          value: `${l.description} | Economia: ${l.annual_savings?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano | Complexidade: ${l.complexity}`,
        })
      })
    }

    if (health_score) {
      sections.push({ label: '---', value: 'HEALTH SCORE' })
      sections.push({ label: 'Score', value: `${health_score.score}/${health_score.max} — Nota ${health_score.grade}` })
      health_score.criteria?.forEach(c => {
        sections.push({ label: c.label, value: `${c.score}/${c.max}` })
      })
    }

    generatePdfFromData({
      title: 'Tax Better — Relatório Técnico para Contador',
      fileName: 'relatorio-tecnico-tributario-safie',
      sections,
    })
  }

  return (
    <div>
      <div className="mb-8">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">
          Ferramenta 2 de 6
        </p>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-bg-dark mb-2">Seu diagnóstico tributário</h1>
        <p className="font-body text-sm text-gray-500">
          Estimativa baseada nos dados informados — valide com seu contador antes de migrar.
        </p>
      </div>

      {/* Botões de PDF */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={handleUserPDF}
          className="flex-1 flex items-center justify-center gap-2 font-cta text-sm font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors px-4 py-2.5 rounded-xl"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Baixar Relatório
        </button>
        <button
          onClick={handleAccountantPDF}
          className="flex-1 flex items-center justify-center gap-2 font-cta text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors px-4 py-2.5 rounded-xl"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Para Contador
        </button>
      </div>

      <VerdictCard results={regimeResults} />
      <RegimeComparisonTable results={regimeResults} recommendedRegime={recommended_regime} />
      <GrowthScenarioChart growthScenarios={growth_scenarios} />
      <TaxLeverList levers={levers} />
      <HealthScoreCard healthScore={health_score} />
      <ContextualCTA
        qualificationData={qualificationData}
        recommendedRegime={recommended_regime}
        annualSavings={annual_savings_potential}
      />

      <p className="font-body text-xs text-gray-500 text-center mt-4 px-4">
        Reforma Tributária: a partir de 2026, IBS e CBS iniciam substituição gradual do PIS/COFINS e ISS. Acompanhe os impactos com seu contador.
      </p>

      <button
        onClick={onReset}
        className="w-full font-cta text-sm text-gray-400 hover:text-primary transition-colors py-3 mt-2"
      >
        Fazer novo diagnóstico
      </button>

      <p className="font-body text-xs text-gray-400 text-center mt-4">
        Alíquotas baseadas na legislação vigente em 2025. Legislação tributária pode ser alterada — valide com seu contador.
      </p>
    </div>
  )
}
