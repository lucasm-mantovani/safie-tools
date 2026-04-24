export default function ContextualCTA({ diagnostic, qualificationData, onExportPDF }) {
  const { overall_readiness, red_flags } = diagnostic
  const hasLegalAdvisor = qualificationData?.has_legal_advisor
  const timelinePreference = qualificationData?.timeline_preference
  const redFlagsCount = red_flags?.length || 0

  const isUrgent = (timelinePreference === 'ate_3_meses' || timelinePreference === '3_a_6_meses') && redFlagsCount >= 2
  const hasMultipleRedFlags = redFlagsCount >= 3 && hasLegalAdvisor !== 'sim_especializado'
  const isReadyNoAdvisor = overall_readiness >= 75 && hasLegalAdvisor !== 'sim_especializado'

  let headline, body, cta

  if (isUrgent) {
    headline = `Seu timeline é de até ${timelinePreference === 'ate_3_meses' ? '3' : '6'} meses e ainda existem ${redFlagsCount} red flags a resolver.`
    body = 'Esse é o momento de agir com rapidez e assertividade. Nossa equipe pode priorizar os pontos críticos e colocar sua empresa no caminho certo dentro do prazo.'
    cta = 'Quero uma análise urgente da SAFIE'
  } else if (hasMultipleRedFlags) {
    headline = `Seu diagnóstico identificou ${redFlagsCount} red flags que precisam de atenção antes de iniciar o processo.`
    body = 'A SAFIE pode ajudar você a resolver esses pontos com assessoria jurídica e contábil especializada em startups e M&A.'
    cta = 'Quero falar com um especialista da SAFIE'
  } else if (isReadyNoAdvisor) {
    headline = 'Sua empresa está bem preparada para iniciar o processo.'
    body = 'Para garantir que nenhum detalhe passe despercebido durante a due diligence do investidor ou comprador, ter um assessor jurídico especializado ao seu lado faz toda a diferença.'
    cta = 'Quero conhecer a assessoria SAFIE para M&A e Captação'
  } else {
    headline = 'Acompanhe o processo com assessoria especializada.'
    body = 'A SAFIE coordena processos completos de due diligence, captação e M&A para empresas de tecnologia — jurídico, fiscal e societário em uma única equipe.'
    cta = 'Conhecer a SAFIE'
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-bg-dark rounded-2xl p-6 text-white">
        <p className="font-cta text-xs font-semibold text-secondary uppercase tracking-widest mb-3">Próximo passo</p>
        <h3 className="font-heading text-lg font-bold mb-2">{headline}</h3>
        <p className="font-body text-sm text-gray-400 leading-relaxed mb-5">{body}</p>
        <a
          href="https://safie.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark transition-colors px-5 py-2.5 rounded-lg"
        >
          {cta}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      <button
        onClick={onExportPDF}
        className="w-full flex items-center justify-center gap-2 font-cta text-sm font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors px-5 py-3 rounded-xl"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        Baixar Relatório Completo em PDF
      </button>
    </div>
  )
}
