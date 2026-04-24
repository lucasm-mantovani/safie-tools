import { CHECKLIST_ITEMS, CATEGORIES, getCategoryOrder } from '../data/dueDiligenceChecklist.js'

function buildResponseMap(checklist_responses) {
  const map = {}
  for (const r of checklist_responses) {
    map[r.id] = r
  }
  return map
}

function getApplicableItems(operation_type) {
  return CHECKLIST_ITEMS.filter(
    item => item.flow === 'both' || item.flow === operation_type
  )
}

function calcCategoryScore(items, responseMap) {
  let achieved = 0
  let maxPossible = 0
  for (const item of items) {
    const resp = responseMap[item.id]
    const status = resp?.status || 'ausente'
    if (status === 'nao_aplicavel') continue
    maxPossible += item.weight
    if (status === 'ok') achieved += item.weight
    else if (status === 'parcial') achieved += item.weight * 0.5
  }
  if (maxPossible === 0) return 100
  return Math.round((achieved / maxPossible) * 100)
}

function generateRedFlags(applicableItems, responseMap) {
  const flags = []
  for (const item of applicableItems) {
    const resp = responseMap[item.id]
    const status = resp?.status || 'ausente'
    if (status === 'nao_aplicavel') continue
    if (status === 'ausente' && item.weight >= 2 && item.red_flag_condition) {
      flags.push({
        item_id: item.id,
        item_title: item.title,
        category: item.category,
        weight: item.weight,
        condition: item.red_flag_condition,
        founder_description: resp?.founder_description || null,
        recommended_action: item.recommended_action,
      })
    }
  }
  return flags.sort((a, b) => b.weight - a.weight)
}

function generateYellowFlags(applicableItems, responseMap) {
  const flags = []
  for (const item of applicableItems) {
    const resp = responseMap[item.id]
    const status = resp?.status || 'ausente'
    if (status === 'nao_aplicavel') continue

    if (status === 'parcial' && item.yellow_flag_condition) {
      flags.push({
        item_id: item.id,
        item_title: item.title,
        category: item.category,
        weight: item.weight,
        condition: item.yellow_flag_condition,
        founder_description: resp?.founder_description || null,
        recommended_action: item.recommended_action,
      })
    } else if (status === 'ausente' && item.weight === 1) {
      flags.push({
        item_id: item.id,
        item_title: item.title,
        category: item.category,
        weight: item.weight,
        condition: item.yellow_flag_condition || item.red_flag_condition || `${item.title} não implementado.`,
        founder_description: resp?.founder_description || null,
        recommended_action: item.recommended_action,
      })
    }
  }
  return flags.sort((a, b) => b.weight - a.weight)
}

function generateRecommendations(responseMap, operation_type, categoryScores, overallReadiness) {
  const recs = []
  const get = (id) => responseMap[id]?.status || 'ausente'

  if (operation_type === 'ma' && (categoryScores['legal'] || 100) < 50) {
    recs.push({
      pattern: 'pattern_no_lawyer',
      text: 'Contrate um assessor jurídico especializado em M&A antes de iniciar qualquer negociação. A ausência de assessoria jurídica especializada é um dos principais fatores de insucesso em transações de M&A para empresas de tecnologia.',
    })
  }

  if ((categoryScores['financial'] || 100) < 60) {
    recs.push({
      pattern: 'pattern_financial_gap',
      text: 'Priorize a organização dos demonstrativos financeiros com apoio de contador. Investidores e compradores sempre iniciam a due diligence pelo financeiro — irregularidades nessa área podem inviabilizar ou atrasar significativamente uma transação.',
    })
  }

  if (get('propriedade_intelectual') === 'ausente' || get('propriedade_codigo') === 'ausente') {
    recs.push({
      pattern: 'pattern_ip_risk',
      text: 'A ausência de cessão de propriedade intelectual é um bloqueador crítico em qualquer processo de captação ou M&A de empresa de tecnologia. Regularize imediatamente com assessoria jurídica antes de iniciar qualquer processo.',
    })
  }

  if (get('key_people') !== 'ok' && get('dependencia_fundador') !== 'ok') {
    recs.push({
      pattern: 'pattern_key_person',
      text: 'Sua empresa apresenta alto risco de concentração em pessoas-chave. Investidores e compradores sempre avaliam o risco de saída de fundadores e executivos críticos. Implemente instrumentos de retenção (vesting, stock options) e inicie a construção de processos independentes de pessoas.',
    })
  }

  if (get('compliance_lgpd') === 'ausente') {
    recs.push({
      pattern: 'pattern_lgpd_risk',
      text: 'A ausência de conformidade com a LGPD representa um risco regulatório e reputacional que aparece em todas as due diligences modernas. Regularize antes de iniciar o processo — é um item de fácil resolução com o apoio jurídico correto.',
    })
  }

  if (operation_type === 'captacao' && get('vesting_fundadores') !== 'ok') {
    recs.push({
      pattern: 'pattern_no_vesting_captacao',
      text: 'Fundadores sem vesting é um sinal de alerta para investidores institucionais. Estruture o vesting antes de iniciar as conversas com fundos — a ausência pode ser interpretada como falta de comprometimento de longo prazo.',
    })
  }

  const runwayStatus = get('runway')
  if (runwayStatus === 'ausente' || (runwayStatus === 'parcial' && operation_type === 'captacao')) {
    recs.push({
      pattern: 'pattern_runway_alert',
      text: 'Monitore e documente seu runway mensalmente. Chegar a uma negociação de captação com runway abaixo de 6 meses coloca o fundador em posição de desvantagem — investidores percebem a urgência e isso impacta negativamente o valuation e os termos.',
    })
  }

  if (overallReadiness >= 75) {
    recs.push({
      pattern: 'pattern_good_standing',
      text: 'Sua empresa apresenta um bom nível de preparação para o processo. Os itens identificados como pendentes são ajustes pontuais que podem ser endereçados em paralelo ao início das conversas com investidores ou compradores. Recomendamos iniciar o processo com assessoria jurídica e financeira especializada para maximizar o resultado.',
    })
  }

  return recs.slice(0, 6)
}

function classifyDealReadiness(pct) {
  if (pct >= 80) return { label: 'Pronto para iniciar o processo', color: 'green' }
  if (pct >= 60) return { label: 'Requer ajustes antes de iniciar', color: 'yellow' }
  if (pct >= 40) return { label: 'Requer preparação significativa', color: 'orange' }
  return { label: 'Não recomendado iniciar o processo no momento', color: 'red' }
}

function estimateTimeline(redFlags, yellowFlags) {
  let minWeeks = 0
  let maxWeeks = 0

  for (const f of redFlags) {
    if (f.weight === 3) { minWeeks += 4; maxWeeks += 8 }
    else if (f.weight === 2) { minWeeks += 2; maxWeeks += 4 }
    else { minWeeks += 1; maxWeeks += 2 }
  }

  for (const f of yellowFlags) {
    minWeeks += 1
    maxWeeks += 2
  }

  let narrative
  if (minWeeks === 0) {
    narrative = 'Sua empresa pode iniciar o processo imediatamente. Os ajustes necessários podem ser feitos em paralelo.'
  } else if (minWeeks <= 4) {
    narrative = `Estimamos de ${minWeeks} a ${maxWeeks} semanas de preparação para endereçar os principais pontos identificados.`
  } else if (minWeeks <= 12) {
    narrative = `Estimamos de ${minWeeks} a ${maxWeeks} semanas de preparação. Recomendamos priorizar os red flags antes de iniciar conversas formais.`
  } else {
    narrative = `Estimamos de ${minWeeks} a ${maxWeeks} semanas para preparação completa. Sugerimos iniciar imediatamente com apoio jurídico e contábil especializado.`
  }

  return { min_weeks: minWeeks, max_weeks: maxWeeks, narrative }
}

export function generateDiagnostic(checklist_responses, operation_type, company_snapshot) {
  const responseMap = buildResponseMap(checklist_responses)
  const applicableItems = getApplicableItems(operation_type)

  // Score geral
  let totalAchieved = 0
  let totalMax = 0
  for (const item of applicableItems) {
    const resp = responseMap[item.id]
    const status = resp?.status || 'ausente'
    if (status === 'nao_aplicavel') continue
    totalMax += item.weight
    if (status === 'ok') totalAchieved += item.weight
    else if (status === 'parcial') totalAchieved += item.weight * 0.5
  }
  const overallReadiness = totalMax === 0 ? 0 : Math.round((totalAchieved / totalMax) * 100)

  // Scores por categoria
  const categoryOrder = getCategoryOrder(operation_type)
  const categoryScores = {}
  for (const catId of categoryOrder) {
    const catItems = applicableItems.filter(i => i.category === catId)
    categoryScores[catId] = calcCategoryScore(catItems, responseMap)
  }

  const categoryLabels = {}
  for (const cat of CATEGORIES) {
    categoryLabels[cat.id] = cat.label
  }

  const redFlags = generateRedFlags(applicableItems, responseMap)
  const yellowFlags = generateYellowFlags(applicableItems, responseMap)
  const recommendations = generateRecommendations(responseMap, operation_type, categoryScores, overallReadiness)
  const dealReadiness = classifyDealReadiness(overallReadiness)
  const timelineEstimate = estimateTimeline(redFlags, yellowFlags)

  return {
    overall_readiness: overallReadiness,
    category_scores: categoryScores,
    category_labels: categoryLabels,
    category_order: categoryOrder,
    red_flags: redFlags,
    yellow_flags: yellowFlags,
    recommendations,
    deal_readiness_classification: dealReadiness,
    timeline_estimate: timelineEstimate,
  }
}
