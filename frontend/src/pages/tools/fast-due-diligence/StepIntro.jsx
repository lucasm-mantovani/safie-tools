import { useDD } from './DDContext'

const PROMISES = [
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Identifique red flags que podem travar sua captação ou M&A',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    text: 'Receba um diagnóstico com prioridades claras de ação',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Saiba em quanto tempo você pode estar pronto para iniciar o processo',
  },
]

export default function StepIntro() {
  const { setOperationType } = useDD()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-4">
          Fast Due Diligence
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-bg-dark mb-4 leading-tight">
          Sua empresa está pronta para uma due diligence?
        </h1>
        <p className="font-body text-base text-gray-500 leading-relaxed">
          Avalie sua prontidão em 55 pontos distribuídos em 7 categorias e receba um diagnóstico personalizado com red flags, yellow flags e recomendações prioritárias.
        </p>
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-cta text-xs font-semibold text-amber-700">20 a 30 minutos para concluir</span>
        </div>
      </div>

      <div className="grid gap-3 mb-10">
        {PROMISES.map((p, i) => (
          <div key={i} className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center shrink-0">
              {p.icon}
            </div>
            <p className="font-body text-sm text-gray-700 leading-relaxed pt-2">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-heading text-lg font-bold text-bg-dark mb-2 text-center">
          Qual é o objetivo da operação?
        </h2>
        <p className="font-body text-sm text-gray-500 text-center mb-6">
          O diagnóstico é personalizado para o tipo de operação que você está preparando.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => setOperationType('captacao')}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="font-cta text-sm font-bold text-bg-dark mb-1">Captação de Investimento</p>
              <p className="font-body text-xs text-gray-500">Seed, Series A, Series B e rodadas institucionais</p>
            </div>
          </button>

          <button
            onClick={() => setOperationType('ma')}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="font-cta text-sm font-bold text-bg-dark mb-1">Operação de M&A</p>
              <p className="font-body text-xs text-gray-500">Venda parcial ou total da empresa (M&A)</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
