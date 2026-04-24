export default function RecommendationsList({ recommendations }) {
  if (!recommendations?.length) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <h3 className="font-heading text-lg font-bold text-bg-dark">Recomendações gerais</h3>
        <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full font-cta text-xs font-semibold">
          {recommendations.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {recommendations.slice(0, 6).map((rec, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-l-4 border-l-primary p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="font-body text-sm text-gray-700 leading-relaxed">{rec.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
