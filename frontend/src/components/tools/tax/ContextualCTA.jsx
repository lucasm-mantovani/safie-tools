const REGIME_LABELS = {
  simples: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

const SAFIE_WHATSAPP = '5511910932154'

function buildWhatsAppLink(regime, savings) {
  const regimeLabel = REGIME_LABELS[regime] || regime
  const savingsText = savings > 0
    ? ` com economia potencial de ${savings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano`
    : ''
  const msg = `Olá, fiz o diagnóstico Tax Better da SAFIE. O regime recomendado foi ${regimeLabel}${savingsText}. Gostaria de saber como migrar com segurança.`
  return `https://wa.me/${SAFIE_WHATSAPP}?text=${encodeURIComponent(msg)}`
}

export default function ContextualCTA({ qualificationData, recommendedRegime, annualSavings }) {
  const hasAccountant = qualificationData?.has_accountant === 'yes'
  const whatsappLink = buildWhatsAppLink(recommendedRegime, annualSavings)

  return (
    <div className="bg-bg-dark rounded-2xl p-6 mb-4 text-white">
      <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-2">Próximo passo</p>

      {hasAccountant ? (
        <>
          <h3 className="font-heading text-lg font-bold mb-2">
            Leve o relatório técnico para o seu contador
          </h3>
          <p className="font-body text-sm text-gray-400 leading-relaxed mb-5">
            Baixe o Relatório para Contador acima e peça uma análise da viabilidade de migrar para o{' '}
            {REGIME_LABELS[recommendedRegime] || recommendedRegime}.
            A SAFIE pode apoiar com a estrutura jurídica da transição.
          </p>
        </>
      ) : (
        <>
          <h3 className="font-heading text-lg font-bold mb-2">
            Reduza sua carga tributária com suporte especializado
          </h3>
          <p className="font-body text-sm text-gray-400 leading-relaxed mb-5">
            A SAFIE pode estruturar a migração para o{' '}
            {REGIME_LABELS[recommendedRegime] || recommendedRegime}{' '}
            e garantir conformidade fiscal em toda a transição.
            {annualSavings > 0 && ` Potencial de economia: ${annualSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano.`}
          </p>
        </>
      )}

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-cta text-sm font-semibold text-white bg-primary hover:bg-secondary hover:text-bg-dark transition-colors px-5 py-2.5 rounded-lg"
      >
        Falar com a SAFIE
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div>
  )
}
