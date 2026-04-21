import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

// Ícones das ferramentas (mesmos do Home.jsx — inline para evitar acoplamento)
function IconBalance() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 3v18M5 7l7-4 7 4M5 7l3 8a4 4 0 008 0l3-8" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  )
}
function IconDocument() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8L14 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
  )
}
function IconGavel() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14.5 3.5l6 6-10 10-6-6 10-10z" />
      <line x1="2" y1="22" x2="8" y2="16" />
    </svg>
  )
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

const FERRAMENTAS = [
  {
    slug: 'equity-calculator',
    nome: 'Equity Calculator',
    nomeCompleto: 'Equity Calculator',
    descricao: 'Simule a divisão justa de cotas entre sócios com critérios objetivos.',
    tempo: '5–10 min',
    Icon: IconBalance,
    cor: '#154efa',
  },
  {
    slug: 'tax-better',
    nome: 'Tax Better',
    nomeCompleto: 'Tax Better',
    descricao: 'Descubra se o regime atual da sua empresa é o mais vantajoso.',
    tempo: '3–5 min',
    Icon: IconChart,
    cor: '#0ea5e9',
  },
  {
    slug: 'pj-risk-calculator',
    nome: 'Risco de Contratação PJ',
    nomeCompleto: 'Calculadora de Risco de Contratação PJ',
    descricao: 'Avalie o risco trabalhista dos seus contratos com prestadores PJ.',
    tempo: '5–8 min',
    Icon: IconShield,
    cor: '#f59e0b',
  },
  {
    slug: 'due-diligence-checklist',
    nome: 'Due Diligence',
    nomeCompleto: 'Gerador de Checklist de Due Diligence',
    descricao: 'Gere um checklist personalizado para captação, M&A ou venda de participação.',
    tempo: '3–5 min',
    Icon: IconDocument,
    cor: '#8b5cf6',
  },
  {
    slug: 'litigation-cost-simulator',
    nome: 'Custo de Litígio',
    nomeCompleto: 'Simulador de Custo de Litígio',
    descricao: 'Estime o custo real de entrar em um processo judicial antes de decidir.',
    tempo: '5–8 min',
    Icon: IconGavel,
    cor: '#ef4444',
  },
  {
    slug: 'prolabore-calculator',
    nome: 'Pró-labore Ideal',
    nomeCompleto: 'Calculadora de Pró-labore Ideal',
    descricao: 'Calcule o mix ideal entre pró-labore e dividendos para maximizar sua renda.',
    tempo: '3–5 min',
    Icon: IconWallet,
    cor: '#10b981',
  },
]

// Banner para completar perfil (aparece quando não há empresa cadastrada)
function ProfileCompletionBanner({ onComplete }) {
  return (
    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p className="font-cta text-sm font-semibold text-bg-dark">Complete seu perfil</p>
          <p className="font-body text-xs text-gray-500 mt-0.5">
            Adicione os dados da sua empresa para personalizar os diagnósticos.
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onComplete} className="shrink-0">
        Completar agora
      </Button>
    </div>
  )
}

// Saudação baseada no horário
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const firstName = profile?.full_name?.split(' ')[0] || 'Founder'
  const greeting = getGreeting()
  const hasCompany = Boolean(profile?.company_name)

  return (
    <div className="min-h-[calc(100vh-72px)] bg-safie-light">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-body text-sm text-gray-400 mb-1">{greeting},</p>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-bg-dark">
                {firstName}
              </h1>
              {hasCompany && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary font-cta text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(21,78,250,0.07)' }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {profile.company_name}
                  </span>
                </div>
              )}
            </div>

            {/* Mini-stats */}
            <div className="flex items-center gap-6">
              <div className="text-center hidden sm:block">
                <p className="font-heading text-2xl font-bold text-bg-dark">6</p>
                <p className="font-body text-xs text-gray-400 mt-0.5">ferramentas disponíveis</p>
              </div>
              <div className="w-px h-10 bg-gray-200 hidden sm:block" />
              <div className="text-center hidden sm:block">
                <p className="font-heading text-2xl font-bold text-bg-dark">0</p>
                <p className="font-body text-xs text-gray-400 mt-0.5">análises realizadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Banner de perfil incompleto */}
        {!hasCompany && (
          <ProfileCompletionBanner onComplete={() => navigate('/completar-perfil')} />
        )}

        {/* Estado vazio: primeira visita */}
        <FirstVisitBanner />

        {/* Título da seção */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-bg-dark">Suas ferramentas</h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">Escolha por onde começar</p>
          </div>
        </div>

        {/* Grid de ferramentas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FERRAMENTAS.map((f, i) => (
            <DashboardToolCard
              key={f.slug}
              ferramenta={f}
              index={i}
              onAccess={() => navigate(`/ferramentas/${f.slug}`)}
            />
          ))}
        </div>

        {/* Sessões recentes — estado vazio por enquanto */}
        <div className="mt-12">
          <h2 className="font-heading text-xl font-bold text-bg-dark mb-4">Histórico de análises</h2>
          <EmptyHistory />
        </div>
      </div>
    </div>
  )
}

// Banner de boas-vindas para primeiro acesso
function FirstVisitBanner() {
  return (
    <div className="relative bg-bg-dark rounded-2xl overflow-hidden p-6 md:p-8 mb-8">
      {/* Decoração de fundo */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border border-primary/20 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-4 right-20 w-2 h-2 rounded-full bg-primary/50 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <span className="inline-block font-cta text-xs font-semibold text-primary/80 uppercase tracking-widest mb-3">
            Comece por aqui
          </span>
          <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-2">
            Qual é o maior desafio da sua empresa agora?
          </h3>
          <p className="font-body text-sm text-white/60 leading-relaxed">
            Cada ferramenta resolve um problema específico. Leva menos de 10 minutos e o resultado é exportável em PDF.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2 text-white/60 font-body text-xs">
            <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            100% gratuito
          </div>
          <div className="flex items-center gap-2 text-white/60 font-body text-xs">
            <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resultado em PDF
          </div>
          <div className="flex items-center gap-2 text-white/60 font-body text-xs">
            <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Criado por especialistas SAFIE
          </div>
        </div>
      </div>
    </div>
  )
}

// Card de ferramenta do dashboard
function DashboardToolCard({ ferramenta, onAccess }) {
  const { Icon, nome, nomeCompleto, descricao, tempo, cor } = ferramenta

  return (
    <div
      className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col gap-4"
      onClick={onAccess}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onAccess()}
      aria-label={`Acessar: ${nomeCompleto}`}
    >
      {/* Header do card */}
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-opacity duration-300"
          style={{ backgroundColor: `${cor}15`, color: cor }}
        >
          <Icon />
        </div>
        <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2.5 py-1">
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="font-cta text-xs text-gray-400">{tempo}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        <h3 className="font-heading text-sm font-bold text-bg-dark mb-1.5 leading-snug">{nomeCompleto}</h3>
        <p className="font-body text-xs text-gray-500 leading-relaxed">{descricao}</p>
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="font-cta text-xs font-semibold" style={{ color: cor }}>
          Iniciar análise
        </span>
        <svg
          className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
          style={{ color: cor }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}

// Estado vazio para o histórico
function EmptyHistory() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="font-heading text-base font-bold text-gray-400 mb-1">Nenhuma análise ainda</p>
      <p className="font-body text-sm text-gray-400 max-w-xs">
        Suas análises salvas aparecerão aqui após você usar as ferramentas pela primeira vez.
      </p>
    </div>
  )
}
