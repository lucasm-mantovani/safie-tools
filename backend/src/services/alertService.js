export function generateAlerts(results, evaluations) {
  const alerts = []
  const sorted = [...results].sort((a, b) => b.percentage - a.percentage)

  if (sorted.length >= 2) {
    const gap = sorted[0].percentage - sorted[1].percentage
    if (sorted[0].percentage > 50 && gap > 25) {
      alerts.push({
        type: 'dominant_partner', severity: 'warning',
        title: 'Sócio dominante detectado',
        message: `${sorted[0].name} detém ${sorted[0].percentage.toFixed(1)}% com ${gap.toFixed(1)}pts de vantagem. Saída antecipada pode comprometer a operação.`,
        recommendation: 'Inclua cláusula de vesting e mecanismos de tag-along no acordo de sócios.',
      })
    }
  }

  if (sorted.every(r => r.percentage < 50)) {
    alerts.push({
      type: 'no_majority', severity: 'info',
      title: 'Nenhum sócio com maioria',
      message: 'Nenhum sócio detém mais de 50%. Decisões estratégicas podem travar sem regras de desempate.',
      recommendation: 'Defina quóruns qualificados e regras de desempate no acordo de sócios.',
    })
  }

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (Math.abs(sorted[i].percentage - sorted[j].percentage) <= 5) {
        alerts.push({
          type: 'similar_profiles', severity: 'info',
          title: 'Perfis muito similares',
          message: `${sorted[i].name} (${sorted[i].percentage.toFixed(1)}%) e ${sorted[j].name} (${sorted[j].percentage.toFixed(1)}%) têm percentuais próximos, o que pode gerar disputas de poder.`,
          recommendation: 'Avalie se os critérios capturam bem as diferenças reais entre os sócios.',
        })
        break
      }
    }
  }

  if (evaluations) {
    evaluations.forEach((ev, idx) => {
      const r = results[idx]
      if (!r) return
      if (!ev.capital.financial_investment && !ev.capital.non_financial_assets && ev.work.weekly_hours < 20) {
        alerts.push({
          type: 'zero_capital', severity: 'warning',
          title: `Atenção: contribuição baixa de ${r.name}`,
          message: `Sem aporte de capital e com dedicação reduzida. Isso pode gerar questionamentos sobre o percentual atribuído.`,
          recommendation: 'Documente claramente a contribuição desse sócio no acordo societário.',
        })
      }
    })
  }

  if (results.length >= 2) {
    alerts.push({
      type: 'vesting', severity: 'success',
      title: 'Recomendação: cláusula de vesting',
      message: 'Com múltiplos sócios, o vesting protege a empresa em caso de saída antecipada.',
      recommendation: 'Cronograma de 4 anos com cliff de 1 ano é o padrão de mercado.',
    })
  }

  return alerts
}
