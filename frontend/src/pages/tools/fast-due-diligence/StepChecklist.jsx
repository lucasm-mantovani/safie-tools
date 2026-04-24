import { useMemo } from 'react'
import { useDD } from './DDContext'
import ChecklistItem from './ChecklistItem'

const ALL_ITEMS_DATA = {
  corporate: {
    label: 'Estrutura Societária e Governança',
    ids: ['contrato_social','acordo_socio','ata_reunioes','estrutura_caps','historico_alteracoes','procuracoes','corporate_compliance','conflito_interesses'],
  },
  legal: {
    label: 'Jurídico e Contencioso',
    ids: ['mapeamento_litigios','contratos_clientes','contratos_fornecedores','pj_exposure','propriedade_intelectual','marcas_patentes','nda_acordos','compliance_lgpd','regulatorio'],
  },
  financial: {
    label: 'Financeiro e Contábil',
    ids: ['demonstracoes_financeiras','regime_tributario','debitos_fiscais','dre_gerencial','projecoes_financeiras','runway','cap_investimentos','contas_bancarias','pro_labore_documentado'],
  },
  product: {
    label: 'Produto e Tecnologia',
    ids: ['codigo_repositorio','propriedade_codigo','infraestrutura','seguranca','dependencias','roadmap','metricas_produto','uptime_sla'],
  },
  hr: {
    label: 'Pessoas e Cultura',
    ids: ['contratos_clt','key_people','organograma','politicas_rh','folha_pagamento','stock_options','passivo_trabalhista'],
  },
  commercial: {
    label: 'Comercial e Mercado',
    ids: ['contratos_receita','concentracao_clientes','churn_documentado','pipeline','nps','dependencia_fundador'],
  },
  captacao_specific: {
    label: 'Específico para Captação',
    ids: ['pitch_deck','one_pager','data_room_basico','valuation_justificado','uso_recursos','historico_captacoes','safe_cla','vesting_fundadores'],
  },
  ma_specific: {
    label: 'Específico para M&A',
    ids: ['tese_venda','valuation_ma','financeiros_auditados','ebitda_ajustado','contratos_change_of_control','lock_up_fundadores','earnout_structure','representacoes_garantias','exclusividade_negociacao','due_diligence_vendedor'],
  },
}

const WEIGHT_MAP = {
  contrato_social:3,acordo_socio:3,ata_reunioes:2,estrutura_caps:3,historico_alteracoes:2,procuracoes:1,corporate_compliance:2,conflito_interesses:2,
  mapeamento_litigios:3,contratos_clientes:3,contratos_fornecedores:2,pj_exposure:3,propriedade_intelectual:3,marcas_patentes:2,nda_acordos:1,compliance_lgpd:3,regulatorio:2,
  demonstracoes_financeiras:3,regime_tributario:2,debitos_fiscais:3,dre_gerencial:2,projecoes_financeiras:3,runway:3,cap_investimentos:2,contas_bancarias:1,pro_labore_documentado:2,
  codigo_repositorio:3,propriedade_codigo:3,infraestrutura:2,seguranca:3,dependencias:2,roadmap:1,metricas_produto:2,uptime_sla:2,
  contratos_clt:3,key_people:3,organograma:1,politicas_rh:1,folha_pagamento:2,stock_options:2,passivo_trabalhista:3,
  contratos_receita:3,concentracao_clientes:2,churn_documentado:2,pipeline:1,nps:1,dependencia_fundador:3,
  pitch_deck:2,one_pager:1,data_room_basico:2,valuation_justificado:2,uso_recursos:3,historico_captacoes:2,safe_cla:2,vesting_fundadores:3,
  tese_venda:2,valuation_ma:3,financeiros_auditados:3,ebitda_ajustado:3,contratos_change_of_control:3,lock_up_fundadores:2,earnout_structure:1,representacoes_garantias:2,exclusividade_negociacao:1,due_diligence_vendedor:2,
}

const DESCRIPTION_MAP = {
  contrato_social:'O Contrato Social é o documento fundador e deve refletir a realidade societária atual.',
  acordo_socio:'Regula as relações entre os sócios com cláusulas de vesting, drag along, tag along, direito de preferência e deadlock.',
  ata_reunioes:'Documenta as decisões societárias relevantes dos últimos 24 meses.',
  estrutura_caps:'Mapeia exatamente quem são os titulares de participação, incluindo opções e instrumentos conversíveis.',
  historico_alteracoes:'Todas as alterações contratuais devem estar registradas na Junta Comercial.',
  procuracoes:'Procurações que concedem poderes a terceiros devem estar mapeadas e revisadas.',
  corporate_compliance:'Certidões negativas da Receita Federal, PGFN, Estadual e Municipal.',
  conflito_interesses:'Política formal de conflito de interesses assinada por sócios e diretores.',
  mapeamento_litigios:'Ações judiciais ativas com valor provisionado contabilmente.',
  contratos_clientes:'Contratos escritos com os 10 maiores clientes, vigentes e revisados juridicamente.',
  contratos_fornecedores:'Contratos com fornecedores críticos com SLA e cláusulas de rescisão.',
  pj_exposure:'Prestadores PJ com avaliação de risco de requalificação como empregados.',
  propriedade_intelectual:'Cessão de PI assinada por todos que contribuíram para o produto.',
  marcas_patentes:'Registro de marca no INPI em vigor ou pedido de registro em andamento.',
  nda_acordos:'NDAs assinados com parceiros, investidores e prestadores.',
  compliance_lgpd:'Política de privacidade, DPO designado, inventário de dados e contratos com operadores.',
  regulatorio:'Licenças e autorizações regulatórias obtidas e vigentes.',
  demonstracoes_financeiras:'DRE, Balanço Patrimonial e Fluxo de Caixa dos últimos 3 exercícios.',
  regime_tributario:'Regime tributário revisado nos últimos 12 meses com comparação de regimes.',
  debitos_fiscais:'Certidões negativas federais, estaduais e municipais sem débitos ativos.',
  dre_gerencial:'DRE gerencial mensal com métricas de unit economics (CAC, LTV, churn, MRR/ARR).',
  projecoes_financeiras:'Projeções financeiras 3-5 anos com premissas documentadas e três cenários.',
  runway:'Runway calculado e monitorado mensalmente com base no burn rate real.',
  cap_investimentos:'Histórico de aportes com instrumento, valor e valuation de cada rodada.',
  contas_bancarias:'Toda movimentação financeira da empresa em contas corporativas.',
  pro_labore_documentado:'Pró-labore dos sócios registrado em folha com INSS recolhido.',
  codigo_repositorio:'Código-fonte em repositório Git privado, sem credenciais expostas.',
  propriedade_codigo:'Empresa proprietária legal de todo o código-fonte com cessão de PI.',
  infraestrutura:'Infraestrutura em contas cloud corporativas, documentada e independente.',
  seguranca:'Autenticação forte, criptografia de dados sensíveis e logs de auditoria.',
  dependencias:'Dependências mapeadas com licenças verificadas e sem vulnerabilidades críticas.',
  roadmap:'Roadmap de produto documentado para os próximos 12 meses.',
  metricas_produto:'DAU/MAU, retenção, NPS e churn monitorados com histórico de 6+ meses.',
  uptime_sla:'SLA de uptime documentado e histórico de disponibilidade dos últimos 12 meses.',
  contratos_clt:'Contratos CLT de todos os funcionários formalizados e atualizados.',
  key_people:'Pessoas-chave identificadas com instrumentos de retenção e plano de sucessão.',
  organograma:'Organograma atualizado com papéis e responsabilidades claros.',
  politicas_rh:'Código de conduta, política de férias e remuneração variável documentados.',
  folha_pagamento:'Folha de pagamento processada por sistema certificado sem atrasos.',
  stock_options:'Plano de stock options ou phantom shares aprovado e formalizado.',
  passivo_trabalhista:'Reclamações trabalhistas ativas mapeadas com provisão contábil.',
  contratos_receita:'Contratos formalizados com clientes que representam +70% da receita.',
  concentracao_clientes:'Nenhum cliente representa mais de 30% da receita total.',
  churn_documentado:'Taxa de churn calculada e documentada com histórico e ação corretiva.',
  pipeline:'Pipeline de vendas documentado em CRM com histórico de conversão.',
  nps:'NPS medido sistematicamente com pelo menos 3 medições históricas.',
  dependencia_fundador:'Processo comercial independente do relacionamento pessoal dos fundadores.',
  pitch_deck:'Pitch deck com as 10 seções padrão de mercado, atualizado.',
  one_pager:'One pager executivo para primeiro contato com investidores.',
  data_room_basico:'Dataroom organizado com documentos essenciais acessíveis com controle.',
  valuation_justificado:'Valuation com metodologia documentada e comparáveis de mercado.',
  uso_recursos:'Uso detalhado dos recursos captados com alocação e timeline.',
  historico_captacoes:'Histórico completo de rodadas com cap table pós-money de cada rodada.',
  safe_cla:'SAFEs e CLAs em aberto mapeados com análise de impacto dilutivo.',
  vesting_fundadores:'Vesting de todos os fundadores documentado e em vigor.',
  tese_venda:'Tese de venda documentada com motivação, compradores estratégicos e expectativa.',
  valuation_ma:'Valuation com metodologia robusta e comparáveis de transações recentes.',
  financeiros_auditados:'Demonstrações financeiras dos últimos 3 anos auditadas por auditor independente.',
  ebitda_ajustado:'EBITDA ajustado calculado com premissas de cada ajuste documentadas.',
  contratos_change_of_control:'Contratos materiais revisados para cláusulas de change of control.',
  lock_up_fundadores:'Disposição ao lock-up de 12-36 meses alinhada entre todos os sócios.',
  earnout_structure:'Métricas e condições de earnout definidas internamente se aplicável.',
  representacoes_garantias:'Reps & warranties preparadas com assessor jurídico especializado em M&A.',
  exclusividade_negociacao:'Política interna sobre exclusividade e processo com múltiplos interessados.',
  due_diligence_vendedor:'Vendor due diligence realizada previamente para identificar e corrigir problemas.',
}

const GUIDANCE_MAP = {
  contrato_social:'Versão consolidada registrada na Junta Comercial há menos de 2 anos, refletindo todas as alterações.',
  acordo_socio:'Documento assinado por todos os sócios com as 5 cláusulas críticas: vesting, drag along, tag along, preferência e deadlock.',
  ata_reunioes:'Atas registradas, arquivadas digitalmente e assinadas, com registro na Junta quando exigido.',
  estrutura_caps:'Planilha ou sistema mostrando percentuais exatos, opções outorgadas e instrumentos conversíveis com impactos dilutivos.',
  historico_alteracoes:'Todas as alterações arquivadas na Junta dentro do prazo legal com comprovante de registro.',
  procuracoes:'Lista atualizada de todas as procurações vigentes com poderes, vigência e procedimento de revogação.',
  corporate_compliance:'Certidões emitidas há menos de 30 dias, sem débitos ativos ou com débitos em parcelamento regular.',
  conflito_interesses:'Política escrita, aprovada em reunião societária e assinada por todos os sócios e diretores.',
  mapeamento_litigios:'Planilha atualizada trimestralmente com valor da causa, probabilidade de perda e provisão contábil.',
  contratos_clientes:'Contratos escritos, assinados, sem cláusulas abusivas e revisados juridicamente nos últimos 2 anos.',
  contratos_fornecedores:'Todos os fornecedores essenciais com contrato escrito e SLA documentado.',
  pj_exposure:'Avaliação formal contra critérios de vínculo empregatício, com estrutura contratual adequada.',
  propriedade_intelectual:'Contratos de cessão assinados por 100% dos contribuidores, incluindo freelancers históricos.',
  marcas_patentes:'Marca registrada ou pedido em andamento no INPI cobrindo as classes relevantes.',
  nda_acordos:'Modelo padrão de NDA utilizado consistentemente com todas as partes externas.',
  compliance_lgpd:'Política publicada e atualizada, DPO designado, inventário de dados mapeado e operadores com contrato.',
  regulatorio:'Todas as licenças necessárias obtidas, vigentes e com renovação monitorada.',
  demonstracoes_financeiras:'Demonstrações completas por competência, assinadas pelo contador responsável, dos últimos 3 exercícios.',
  regime_tributario:'Revisão documentada nos últimos 12 meses comparando os três regimes.',
  debitos_fiscais:'Certidões emitidas há menos de 30 dias sem débitos ativos ou com parcelamento regular.',
  dre_gerencial:'Dashboard financeiro atualizado mensalmente com histórico de pelo menos 12 meses de MRR, CAC, LTV e churn.',
  projecoes_financeiras:'Modelo financeiro com premissas explícitas por item, três cenários e sensibilidade às principais variáveis.',
  runway:'Cálculo atualizado mensalmente com burn rate real dos últimos 3 meses.',
  cap_investimentos:'Quadro consolidado de todas as rodadas com instrumento, data, valor, valuation e cap table resultante.',
  contas_bancarias:'Toda movimentação financeira realizada exclusivamente por contas em nome da empresa.',
  pro_labore_documentado:'Pró-labore de todos os sócios ativos registrado em folha com INSS recolhido.',
  codigo_repositorio:'Repositório Git privado, histórico sem secrets, README com arquitetura básica.',
  propriedade_codigo:'Todos os contribuidores históricos e atuais com contrato de cessão de PI assinado.',
  infraestrutura:'Infraestrutura em contas cloud corporativas, documentada, com acesso compartilhado entre dois responsáveis.',
  seguranca:'Autenticação forte (2FA), dados sensíveis criptografados em trânsito e repouso, logs de acesso.',
  dependencias:'Inventário de dependências com licenças verificadas e scan de vulnerabilidades nos últimos 90 dias.',
  roadmap:'Roadmap com épicos priorizados para 12 meses, com critérios de priorização documentados.',
  metricas_produto:'Dashboard de produto com métricas-chave e histórico de pelo menos 6 meses exportável.',
  uptime_sla:'SLA documentado em contratos, monitoramento ativo e histórico de 12 meses.',
  contratos_clt:'Todos os empregados com contrato assinado, CTPS anotada e ficha de registro atualizada.',
  key_people:'Identificação formal de key people, instrumentos de retenção vigentes e plano de sucessão aprovado.',
  organograma:'Organograma revisado nos últimos 6 meses com nomes, cargos e linhas de reporte.',
  politicas_rh:'Handbook do colaborador com políticas relevantes, assinado e acessível a todos.',
  folha_pagamento:'Folha processada mensalmente por sistema certificado (eSocial integrado) sem atrasos.',
  stock_options:'Plano aprovado em assembleia, contrato de outorga individual por beneficiário e cálculo de diluição.',
  passivo_trabalhista:'Lista atualizada com probabilidade de perda, provisão contábil e histórico de acordos.',
  contratos_receita:'Contratos escritos e assinados com clientes que representam pelo menos 70% do faturamento.',
  concentracao_clientes:'Cliente mais relevante com menos de 30% do faturamento com tendência de diversificação.',
  churn_documentado:'Dashboard com churn mensal calculado corretamente e histórico de 12+ meses.',
  pipeline:'CRM ativo com pipeline atualizado e taxas de conversão por etapa calculadas.',
  nps:'NPS medido ao menos trimestralmente com histórico de 3 ou mais medições.',
  dependencia_fundador:'Processo de vendas documentado, time comercial treinado e capaz de fechar sem o fundador.',
  pitch_deck:'Deck de até 15 slides com os 10 temas obrigatórios, revisado por alguém externo.',
  one_pager:'Documento de uma página com problema, solução, tração, time e pedido de captação.',
  data_room_basico:'Pasta organizada com financeiro, societário e produto, acessível com link controlado por investidor.',
  valuation_justificado:'Tese de valuation com pelo menos uma metodologia e premissas explícitas.',
  uso_recursos:'Planilha com alocação por área, valor por item, prazo e métricas que cada investimento visa atingir.',
  historico_captacoes:'Quadro consolidado com data, valor, valuation pré/pós, instrumento e cap table de cada rodada.',
  safe_cla:'Planilha com todos os instrumentos conversíveis mostrando cap, discount, MFN e impacto dilutivo.',
  vesting_fundadores:'Contrato de vesting assinado por todos os fundadores com cliff de 1 ano e vesting de 4 anos.',
  tese_venda:'Documento interno com motivação, compradores estratégicos, expectativa de valuation e estrutura preferida.',
  valuation_ma:'Relatório com pelo menos duas metodologias e comparáveis de transações recentes.',
  financeiros_auditados:'Demonstrações financeiras dos últimos 3 exercícios com parecer de auditoria independente.',
  ebitda_ajustado:'EBITDA ajustado por exercício com cada ajuste identificado e documentado em memorando.',
  contratos_change_of_control:'Revisão jurídica de todos os contratos materiais com mapa de cláusulas de change of control.',
  lock_up_fundadores:'Alinhamento interno documentado sobre disposição ao lock-up de cada sócio.',
  earnout_structure:'Modelo financeiro com cenários de earnout e métricas acordadas internamente.',
  representacoes_garantias:'Assessor jurídico especializado em M&A contratado e minuta de reps & warranties em elaboração.',
  exclusividade_negociacao:'Política interna aprovada pelos sócios sobre exclusividade e process letter para múltiplos interessados.',
  due_diligence_vendedor:'VDD completa (jurídica, contábil, tecnologia) com relatório de achados e plano de correção.',
}

function buildItem(id) {
  return {
    id,
    weight: WEIGHT_MAP[id] || 1,
    title: '',
    description: DESCRIPTION_MAP[id] || '',
    guidance: GUIDANCE_MAP[id] || '',
  }
}

const CATEGORY_META = {
  corporate: { label: 'Estrutura Societária e Governança', emoji: '🏛️', ids: ['contrato_social','acordo_socio','ata_reunioes','estrutura_caps','historico_alteracoes','procuracoes','corporate_compliance','conflito_interesses'] },
  legal: { label: 'Jurídico e Contencioso', emoji: '⚖️', ids: ['mapeamento_litigios','contratos_clientes','contratos_fornecedores','pj_exposure','propriedade_intelectual','marcas_patentes','nda_acordos','compliance_lgpd','regulatorio'] },
  financial: { label: 'Financeiro e Contábil', emoji: '💰', ids: ['demonstracoes_financeiras','regime_tributario','debitos_fiscais','dre_gerencial','projecoes_financeiras','runway','cap_investimentos','contas_bancarias','pro_labore_documentado'] },
  product: { label: 'Produto e Tecnologia', emoji: '💻', ids: ['codigo_repositorio','propriedade_codigo','infraestrutura','seguranca','dependencias','roadmap','metricas_produto','uptime_sla'] },
  hr: { label: 'Pessoas e Cultura', emoji: '👥', ids: ['contratos_clt','key_people','organograma','politicas_rh','folha_pagamento','stock_options','passivo_trabalhista'] },
  commercial: { label: 'Comercial e Mercado', emoji: '📈', ids: ['contratos_receita','concentracao_clientes','churn_documentado','pipeline','nps','dependencia_fundador'] },
  captacao_specific: { label: 'Específico para Captação', emoji: '🚀', ids: ['pitch_deck','one_pager','data_room_basico','valuation_justificado','uso_recursos','historico_captacoes','safe_cla','vesting_fundadores'] },
  ma_specific: { label: 'Específico para M&A', emoji: '🤝', ids: ['tese_venda','valuation_ma','financeiros_auditados','ebitda_ajustado','contratos_change_of_control','lock_up_fundadores','earnout_structure','representacoes_garantias','exclusividade_negociacao','due_diligence_vendedor'] },
}

const ITEM_TITLES = {
  contrato_social:'Contrato Social atualizado e consolidado',
  acordo_socio:'Acordo de Sócios com cláusulas essenciais',
  ata_reunioes:'Atas de reuniões dos últimos 24 meses',
  estrutura_caps:'Cap table atualizado e completo',
  historico_alteracoes:'Histórico de alterações registrado na Junta',
  procuracoes:'Procurações outorgadas a terceiros mapeadas',
  corporate_compliance:'Certidões negativas de débitos',
  conflito_interesses:'Política de conflito de interesses documentada',
  mapeamento_litigios:'Mapeamento completo de litígios com provisão',
  contratos_clientes:'Contratos com os 10 maiores clientes revisados',
  contratos_fornecedores:'Contratos com fornecedores críticos formalizados',
  pj_exposure:'Risco de requalificação de prestadores PJ avaliado',
  propriedade_intelectual:'Cessão de PI por todos os contribuidores',
  marcas_patentes:'Registro de marca no INPI em vigor',
  nda_acordos:'NDAs com parceiros, investidores e prestadores',
  compliance_lgpd:'Conformidade com LGPD implementada',
  regulatorio:'Licenças e autorizações regulatórias obtidas',
  demonstracoes_financeiras:'Demonstrações financeiras dos últimos 3 exercícios',
  regime_tributario:'Regime tributário revisado nos últimos 12 meses',
  debitos_fiscais:'Certidões negativas de débitos fiscais',
  dre_gerencial:'DRE gerencial mensal com unit economics',
  projecoes_financeiras:'Projeções financeiras para 3 a 5 anos documentadas',
  runway:'Runway calculado e monitorado mensalmente',
  cap_investimentos:'Histórico de aportes anteriores documentado',
  contas_bancarias:'Contas bancárias empresariais separadas das pessoais',
  pro_labore_documentado:'Pró-labore dos sócios documentado e na folha',
  codigo_repositorio:'Código-fonte em repositório versionado',
  propriedade_codigo:'Empresa proprietária legal de todo o código-fonte',
  infraestrutura:'Infraestrutura em cloud documentada e independente',
  seguranca:'Política de segurança da informação implementada',
  dependencias:'Dependências de software mapeadas e licenças verificadas',
  roadmap:'Roadmap de produto documentado para 12 meses',
  metricas_produto:'Métricas de produto monitoradas com histórico',
  uptime_sla:'SLA de uptime documentado e histórico disponível',
  contratos_clt:'Contratos CLT formalizados e atualizados',
  key_people:'Retenção de pessoas-chave estruturada',
  organograma:'Organograma atualizado com papéis e responsabilidades',
  politicas_rh:'Políticas de RH documentadas',
  folha_pagamento:'Folha de pagamento processada corretamente',
  stock_options:'Plano de stock options ou phantom shares formalizado',
  passivo_trabalhista:'Passivo trabalhista mapeado e provisionado',
  contratos_receita:'Contratos formalizados com 70% da receita',
  concentracao_clientes:'Nenhum cliente representa mais de 30% da receita',
  churn_documentado:'Taxa de churn calculada e documentada com histórico',
  pipeline:'Pipeline de vendas documentado em CRM',
  nps:'NPS medido sistematicamente',
  dependencia_fundador:'Processo comercial independente dos fundadores',
  pitch_deck:'Pitch deck atualizado com seções padrão de mercado',
  one_pager:'One pager executivo para primeiro contato',
  data_room_basico:'Dataroom básico organizado e acessível',
  valuation_justificado:'Valuation com metodologia documentada',
  uso_recursos:'Uso detalhado dos recursos captados',
  historico_captacoes:'Histórico de rodadas anteriores documentado',
  safe_cla:'SAFEs e CLAs em aberto mapeados com análise dilutiva',
  vesting_fundadores:'Vesting dos fundadores documentado e em vigor',
  tese_venda:'Tese de venda documentada',
  valuation_ma:'Valuation preparado com metodologia robusta',
  financeiros_auditados:'Demonstrações financeiras auditadas (3 anos)',
  ebitda_ajustado:'EBITDA ajustado calculado e documentado',
  contratos_change_of_control:'Cláusulas de change of control identificadas',
  lock_up_fundadores:'Disposição ao lock-up pós-fechamento alinhada entre sócios',
  earnout_structure:'Estrutura de earnout definida internamente',
  representacoes_garantias:'Representações e garantias preparadas com assessor M&A',
  exclusividade_negociacao:'Política de exclusividade de negociação definida',
  due_diligence_vendedor:'Vendor due diligence (VDD) realizada',
}

function CategorySummary({ categoryId, items, onContinue, isLast }) {
  const { checklistResponses } = useDD()

  const counted = items.reduce((acc, item) => {
    const status = checklistResponses[item.id]?.status || 'ausente'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const potentialRedFlags = items.filter(item => {
    const status = checklistResponses[item.id]?.status || 'ausente'
    return status === 'ausente' && item.weight >= 2
  }).length

  const potentialYellowFlags = items.filter(item => {
    const status = checklistResponses[item.id]?.status || 'ausente'
    return (status === 'parcial') || (status === 'ausente' && item.weight === 1)
  }).length

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="font-heading text-lg font-bold text-bg-dark mb-1">Categoria concluída</h3>
      <p className="font-body text-sm text-gray-500 mb-5">{CATEGORY_META[categoryId]?.label}</p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="font-heading text-2xl font-bold text-emerald-600">{counted.ok || 0}</p>
          <p className="font-body text-xs text-emerald-700 mt-0.5">Ok</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3">
          <p className="font-heading text-2xl font-bold text-amber-600">{(counted.parcial || 0)}</p>
          <p className="font-body text-xs text-amber-700 mt-0.5">Parcial</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3">
          <p className="font-heading text-2xl font-bold text-red-600">{counted.ausente || 0}</p>
          <p className="font-body text-xs text-red-700 mt-0.5">Ausente</p>
        </div>
      </div>

      {(potentialRedFlags > 0 || potentialYellowFlags > 0) && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 text-left">
          {potentialRedFlags > 0 && (
            <p className="font-body text-xs text-red-600 mb-1">
              ⚠ {potentialRedFlags} potencial{potentialRedFlags > 1 ? 'is' : ''} red flag{potentialRedFlags > 1 ? 's' : ''} detectado{potentialRedFlags > 1 ? 's' : ''}
            </p>
          )}
          {potentialYellowFlags > 0 && (
            <p className="font-body text-xs text-amber-600">
              ⚠ {potentialYellowFlags} potencial{potentialYellowFlags > 1 ? 'is' : ''} yellow flag{potentialYellowFlags > 1 ? 's' : ''} detectado{potentialYellowFlags > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark transition-colors px-5 py-3 rounded-xl"
      >
        {isLast ? 'Finalizar checklist →' : 'Continuar →'}
      </button>
    </div>
  )
}

export default function StepChecklist() {
  const {
    operationType,
    checklistCategoryIndex,
    checklistSubStep,
    checklistResponses,
    getCategoryOrder,
    setCategoryIndex,
    setChecklistSubStep,
    goToStep,
  } = useDD()

  const categoryOrder = getCategoryOrder(operationType)
  const currentCategoryId = categoryOrder[checklistCategoryIndex]
  const catMeta = CATEGORY_META[currentCategoryId]

  const currentItems = useMemo(() => {
    return (catMeta?.ids || []).map(id => ({
      ...buildItem(id),
      title: ITEM_TITLES[id] || id,
    }))
  }, [currentCategoryId])

  const allAnswered = currentItems.every(item => {
    return !!checklistResponses[item.id]?.status
  })

  const answeredCount = currentItems.filter(item => !!checklistResponses[item.id]?.status).length

  function handleContinue() {
    const isLast = checklistCategoryIndex === categoryOrder.length - 1
    if (isLast) {
      goToStep('QUALIFICATION_MODAL')
    } else {
      setCategoryIndex(checklistCategoryIndex + 1)
    }
  }

  function handleBack() {
    if (checklistSubStep === 'summary') {
      setChecklistSubStep('items')
      return
    }
    if (checklistCategoryIndex === 0) {
      goToStep('COMPANY_SNAPSHOT')
    } else {
      setCategoryIndex(checklistCategoryIndex - 1)
    }
  }

  const isLast = checklistCategoryIndex === categoryOrder.length - 1

  return (
    <div className="flex gap-6 max-w-4xl mx-auto w-full">
      {/* Sidebar de progresso — desktop */}
      <div className="hidden lg:block w-52 shrink-0">
        <div className="sticky top-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="font-cta text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Progresso</p>
          <div className="flex flex-col gap-1">
            {categoryOrder.map((catId, idx) => {
              const meta = CATEGORY_META[catId]
              const catItems = (meta?.ids || [])
              const answered = catItems.filter(id => !!checklistResponses[id]?.status).length
              const isDone = answered === catItems.length && catItems.length > 0
              const isCurrent = idx === checklistCategoryIndex
              return (
                <button
                  key={catId}
                  onClick={() => idx <= checklistCategoryIndex && setCategoryIndex(idx)}
                  disabled={idx > checklistCategoryIndex}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                    isCurrent ? 'bg-primary/10 text-primary' :
                    isDone ? 'text-emerald-600 hover:bg-emerald-50' :
                    idx < checklistCategoryIndex ? 'text-gray-500 hover:bg-gray-50' :
                    'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span className="text-sm">{meta?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs font-medium leading-tight truncate">{meta?.label}</p>
                    {idx <= checklistCategoryIndex && (
                      <p className="font-body text-xs text-gray-400">{answered}/{catItems.length}</p>
                    )}
                  </div>
                  {isDone && !isCurrent && (
                    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0">
        {/* Barra de progresso mobile */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-cta text-xs font-semibold text-gray-500">
              Categoria {checklistCategoryIndex + 1} de {categoryOrder.length}
            </p>
            <p className="font-cta text-xs font-semibold text-primary">{answeredCount}/{currentItems.length} respondidos</p>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((checklistCategoryIndex + (allAnswered ? 1 : 0)) / categoryOrder.length) * 100}%` }}
            />
          </div>
        </div>

        {checklistSubStep === 'summary' ? (
          <CategorySummary
            categoryId={currentCategoryId}
            items={currentItems}
            onContinue={handleContinue}
            isLast={isLast}
          />
        ) : (
          <>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{catMeta?.emoji}</span>
                <h2 className="font-heading text-xl font-bold text-bg-dark">{catMeta?.label}</h2>
              </div>
              <p className="font-body text-xs text-gray-400">
                {checklistCategoryIndex + 1} de {categoryOrder.length} categorias
                {answeredCount > 0 && ` · ${answeredCount} de ${currentItems.length} respondidos`}
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {currentItems.map(item => (
                <ChecklistItem key={item.id} item={item} />
              ))}
            </div>

            <button
              onClick={() => setChecklistSubStep('summary')}
              disabled={!allAnswered}
              className="w-full font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-5 py-3.5 rounded-xl"
            >
              {allAnswered ? 'Ver resumo da categoria →' : `Responda todos os ${currentItems.length - answeredCount} itens restantes`}
            </button>

            <button
              onClick={handleBack}
              className="w-full mt-2 font-cta text-sm text-gray-400 hover:text-primary transition-colors py-2"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
