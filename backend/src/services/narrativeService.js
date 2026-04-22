const DIM_PT = {
  capital: 'Capital',
  work: 'Trabalho e Dedicação',
  knowledge: 'Conhecimento',
  risk: 'Risco e Comprometimento',
}

function topDim(dimScores) {
  return Object.entries(dimScores).sort((a, b) => b[1] - a[1])[0][0]
}

export function generateNarrative(results, dimensionWeights) {
  const sorted = [...results].sort((a, b) => b.percentage - a.percentage)
  const [first, second] = sorted
  const gap = first.percentage - (second?.percentage || 0)
  const mainDim = topDim(first.dimension_scores)

  const p1 = gap > 25
    ? `A simulação indica uma distribuição assimétrica, com ${first.name} na liderança com ${first.percentage.toFixed(1)}% das cotas. Esse resultado reflete uma diferença substancial nas contribuições avaliadas entre os sócios.`
    : gap < 8
    ? `O resultado aponta para uma divisão bastante equilibrada: ${first.name} (${first.percentage.toFixed(1)}%) e ${second?.name} (${second?.percentage?.toFixed(1)}%) apresentam perfis de contribuição similares, o que favorece coesão e confiança entre os sócios.`
    : `A simulação gerou uma distribuição com diferenciação moderada. ${first.name} lidera com ${first.percentage.toFixed(1)}%, seguido de ${second?.name} com ${second?.percentage?.toFixed(1)}%, refletindo distinções relevantes nos critérios avaliados.`

  const p2 = `A dimensão "${DIM_PT[mainDim]}" (peso ${dimensionWeights[mainDim]}%) foi o principal fator diferenciador nesta avaliação. Para ${first.name}, a pontuação nessa dimensão foi determinante para seu percentual final, indicando que esse tipo de contribuição é a base da estrutura societária desta equipe.`

  const balanced = results.every(r => Math.abs(r.percentage - 100 / results.length) < 10)
  const p3 = balanced
    ? `Os perfis dos sócios se mostraram complementares e equivalentes nos critérios ponderados — indicativo saudável para uma sociedade sustentável, onde nenhum sócio depende excessivamente dos demais.`
    : `A assimetria nos percentuais reflete especializações distintas dentro da equipe. Uma distribuição não uniforme não é problemática em si — o que importa é que todos os sócios reconheçam e aceitem a lógica por trás dos números antes de qualquer formalização.`

  const p4 = `Esta simulação é um ponto de partida para a conversa sobre divisão de cotas, não uma conclusão definitiva. Recomenda-se usá-la como base de negociação, ajustando os pesos conforme o entendimento do grupo. A formalização deve ser conduzida por advogado especializado em direito societário.`

  return [p1, p2, p3, p4]
}
