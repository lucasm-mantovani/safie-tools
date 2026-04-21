import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

// Icons das ferramentas — SVG geométrico, estilo line art premium
function IconBalance() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 3v18M5 7l7-4 7 4M5 7l3 8a4 4 0 008 0l3-8" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  )
}
function IconDocument() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8L14 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
      <polyline points="9 9 10 9" />
    </svg>
  )
}
function IconGavel() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M14.5 3.5l6 6-10 10-6-6 10-10z" />
      <line x1="2" y1="22" x2="8" y2="16" />
      <line x1="5" y1="16" x2="2" y2="19" />
    </svg>
  )
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 13a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

const FERRAMENTAS = [
  {
    slug: 'equity-calculator',
    nome: 'Divisão de Participações Societárias',
    descricao: 'Simule a distribuição justa de cotas entre sócios com critérios objetivos e imparciais.',
    Icon: IconBalance,
  },
  {
    slug: 'tax-regime-diagnostic',
    nome: 'Diagnóstico de Regime Tributário',
    descricao: 'Descubra se sua empresa está no regime mais vantajoso e quanto você pode economizar.',
    Icon: IconChart,
  },
  {
    slug: 'pj-risk-calculator',
    nome: 'Calculadora de Risco de Contratação PJ',
    descricao: 'Avalie o risco trabalhista dos seus contratos PJ antes que o problema chegue na Justiça.',
    Icon: IconShield,
  },
  {
    slug: 'due-diligence-checklist',
    nome: 'Gerador de Checklist de Due Diligence',
    descricao: 'Checklist personalizado para captação, M&A ou venda de participação societária.',
    Icon: IconDocument,
  },
  {
    slug: 'litigation-cost-simulator',
    nome: 'Simulador de Custo de Litígio',
    descricao: 'Estime o custo real de um processo judicial e decida com dados — não com intuição.',
    Icon: IconGavel,
  },
  {
    slug: 'prolabore-calculator',
    nome: 'Calculadora de Pró-labore Ideal',
    descricao: 'Descubra o mix ideal entre pró-labore e dividendos para maximizar sua remuneração líquida.',
    Icon: IconWallet,
  },
]

const COMO_FUNCIONA = [
  {
    numero: '01',
    titulo: 'Crie sua conta gratuita',
    descricao: 'Cadastro em menos de 2 minutos. Sem cartão de crédito.',
  },
  {
    numero: '02',
    titulo: 'Use as ferramentas',
    descricao: 'Responda perguntas sobre seu negócio e receba um diagnóstico preciso.',
  },
  {
    numero: '03',
    titulo: 'Receba seu resultado',
    descricao: 'Relatório exportável em PDF com recomendações práticas e acionáveis.',
  },
]

// Decoração geométrica do Hero
function HeroDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Círculo grande — canto superior direito */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-primary/20 animate-pulse-ring" />
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-primary/10" />
      {/* Círculo pequeno — canto inferior esquerdo */}
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white/5" />
      {/* Ponto de luz */}
      <div className="absolute top-20 right-1/4 w-2 h-2 rounded-full bg-primary/60" />
      <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 rounded-full bg-primary/40" />
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  function handlePrimaryCta() {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/cadastro')
    }
  }

  return (
    <div className="bg-safie-light">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden py-28 md:py-36 px-6">
        <HeroDecoration />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-cta text-xs font-medium text-white/80 tracking-wide uppercase">
              100% gratuito para founders
            </span>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up delay-100">
            Decisões jurídicas e contábeis{' '}
            <br className="hidden md:block" />
            <span
              style={{
                backgroundImage: 'linear-gradient(90deg, #154efa, #6b8fff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              com mais segurança
            </span>
          </h1>

          <p className="font-body text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Seis ferramentas gratuitas desenvolvidas por especialistas da SAFIE para founders e gestores de empresas de tecnologia. Sem jargão jurídico. Sem enrolação.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Button variant="primary" size="lg" onClick={handlePrimaryCta} className="w-full sm:w-auto min-w-[200px]">
              {user ? 'Ir para o Dashboard' : 'Começar gratuitamente'}
            </Button>
            {!user && (
              <button
                onClick={() => {
                  document.getElementById('ferramentas')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="font-cta text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
              >
                Ver as ferramentas
                <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Prova social mínima */}
          <p className="font-body text-xs text-white/40 mt-10 animate-fade-in-up delay-400">
            Criado pela SAFIE — Consultoria Jurídica e Contábil para empresas de tecnologia
          </p>
        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-3">Simples assim</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-bg-dark">
              Como funciona
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {COMO_FUNCIONA.map((step, i) => (
              <div key={step.numero} className="flex flex-col items-center md:items-start text-center md:text-left">
                {/* Número */}
                <div className="relative mb-6">
                  <span className="font-heading text-5xl font-bold text-primary/10 select-none leading-none">
                    {step.numero}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-1">
                    <span className="font-cta text-xs font-bold text-primary uppercase tracking-widest">
                      Passo {i + 1}
                    </span>
                  </div>
                </div>
                <h3 className="font-heading text-lg font-bold text-bg-dark mb-2">{step.titulo}</h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed">{step.descricao}</p>

                {/* Conector entre steps (só no desktop) */}
                {i < COMO_FUNCIONA.length - 1 && (
                  <div className="hidden md:block absolute" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FERRAMENTAS ──────────────────────────────────────────── */}
      <section id="ferramentas" className="py-20 px-6 bg-safie-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-cta text-xs font-semibold text-primary uppercase tracking-widest mb-3">Portfólio</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-bg-dark mb-4">
              Seis ferramentas, zero custo
            </h2>
            <p className="font-body text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              Cada ferramenta foi desenhada para resolver um problema real que founders enfrentam — e entregar um resultado concreto em minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FERRAMENTAS.map((f) => (
              <ToolCard key={f.slug} ferramenta={f} onAccess={() => navigate(user ? `/ferramentas/${f.slug}` : `/cadastro?tool=${f.slug}`)} />
            ))}
          </div>

          {!user && (
            <div className="text-center mt-12">
              <p className="font-body text-sm text-gray-400 mb-4">
                Crie uma conta gratuita para acessar todas as ferramentas
              </p>
              <Button variant="primary" size="md" onClick={() => navigate('/cadastro')}>
                Criar conta gratuitamente
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────── */}
      {!user && (
        <section className="hero-gradient py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para tomar decisões com mais segurança?
            </h2>
            <p className="font-body text-white/60 mb-10 text-sm md:text-base">
              Junte-se a founders que já usam as ferramentas da SAFIE para proteger e escalar seus negócios.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/cadastro')} className="min-w-[220px]">
              Começar agora — é grátis
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}

// Card de ferramenta com hover premium
function ToolCard({ ferramenta, onAccess }) {
  const { Icon, nome, descricao } = ferramenta
  return (
    <div
      className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-primary/20 overflow-hidden"
      onClick={onAccess}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onAccess()}
      aria-label={`Acessar: ${nome}`}
    >
      {/* Barra de acento esquerda */}
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Ícone */}
      <div className="w-11 h-11 rounded-xl bg-primary/8 group-hover:bg-primary/15 flex items-center justify-center mb-5 text-primary transition-colors duration-300"
        style={{ backgroundColor: 'rgba(21,78,250,0.07)' }}>
        <Icon />
      </div>

      {/* Conteúdo */}
      <h3 className="font-heading text-base font-bold text-bg-dark mb-2 leading-snug">
        {nome}
      </h3>
      <p className="font-body text-sm text-gray-500 leading-relaxed mb-5 flex-1">
        {descricao}
      </p>

      {/* CTA */}
      <div className="flex items-center gap-1.5 font-cta text-sm font-semibold text-primary">
        <span>Acessar ferramenta</span>
        <span className="group-hover:translate-x-1.5 transition-transform duration-200 inline-block">→</span>
      </div>
    </div>
  )
}
