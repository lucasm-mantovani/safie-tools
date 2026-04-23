import { useTax } from './TaxContext'
import Button from '../../../components/ui/Button'

const PROMISES = [
  {
    icon: '📊',
    title: 'Comparativo entre 3 regimes',
    desc: 'Simples Nacional, Lucro Presumido e Lucro Real com cálculo real dos tributos.',
  },
  {
    icon: '💰',
    title: 'Economia anual em reais',
    desc: 'Saiba exatamente quanto você pode economizar migrando para o regime ideal.',
  },
  {
    icon: '📈',
    title: 'Projeção de crescimento',
    desc: 'Veja qual regime é mais vantajoso à medida que sua receita cresce.',
  },
]

export default function StepIntro() {
  const { goToStep } = useTax()
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {PROMISES.map((p) => (
          <div key={p.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-2xl mb-3">{p.icon}</div>
            <h3 className="font-heading text-sm font-bold text-bg-dark mb-1">{p.title}</h3>
            <p className="font-body text-xs text-gray-500 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-bg-dark">Tempo estimado: 5 a 8 minutos</p>
            <p className="font-body text-xs text-gray-400">Tenha em mãos: faturamento, custos e pró-labore dos sócios</p>
          </div>
        </div>
        <p className="font-body text-sm text-gray-600 leading-relaxed">
          O resultado é uma estimativa baseada nos dados informados. Para decisões de migração, valide sempre com seu contador.
        </p>
      </div>

      <Button variant="primary" size="md" onClick={() => goToStep('COMPANY_PROFILE')} className="w-full">
        Iniciar diagnóstico →
      </Button>
    </div>
  )
}
