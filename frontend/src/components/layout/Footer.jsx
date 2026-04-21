import { Link } from 'react-router-dom'

const FERRAMENTAS_FOOTER = [
  { slug: 'equity-calculator', nome: 'Equity Calculator' },
  { slug: 'tax-regime-diagnostic', nome: 'Diagnóstico Tributário' },
  { slug: 'pj-risk-calculator', nome: 'Risco de Contratação PJ' },
  { slug: 'due-diligence-checklist', nome: 'Due Diligence' },
  { slug: 'litigation-cost-simulator', nome: 'Custo de Litígio' },
  { slug: 'prolabore-calculator', nome: 'Pró-labore Ideal' },
]

export default function Footer() {
  return (
    <footer className="w-full bg-bg-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Coluna 1 — Marca */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-heading text-lg font-bold text-white">SAFIE Tools</span>
            </div>
            <p className="font-body text-sm text-gray-400 leading-relaxed max-w-xs">
              Ferramentas gratuitas para founders e gestores de empresas de tecnologia tomarem decisões com mais segurança jurídica e contábil.
            </p>
            <p className="font-body text-xs text-gray-600 mt-4">
              ferramentas.safie.com.br
            </p>
          </div>

          {/* Coluna 2 — Ferramentas */}
          <div>
            <p className="font-cta text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Ferramentas</p>
            <ul className="flex flex-col gap-2.5">
              {FERRAMENTAS_FOOTER.map((f) => (
                <li key={f.slug}>
                  <Link
                    to={`/ferramentas/${f.slug}`}
                    className="font-body text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {f.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3 — Conta */}
          <div>
            <p className="font-cta text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Conta</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link to="/cadastro" className="font-body text-sm text-gray-400 hover:text-white transition-colors">
                  Criar conta grátis
                </Link>
              </li>
              <li>
                <Link to="/login" className="font-body text-sm text-gray-400 hover:text-white transition-colors">
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="font-body text-sm text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="font-cta text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Sobre a SAFIE</p>
              <p className="font-body text-xs text-gray-500 leading-relaxed">
                Consultoria jurídica e contábil especializada em empresas digitais e de tecnologia.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé legal */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-body text-xs text-gray-600">
            © {new Date().getFullYear()} SAFIE Consultoria Jurídica e Contábil. Todos os direitos reservados.
          </p>
          <p className="font-body text-xs text-gray-700">
            As ferramentas são informativas e não substituem orientação jurídica ou contábil profissional.
          </p>
        </div>
      </div>
    </footer>
  )
}
