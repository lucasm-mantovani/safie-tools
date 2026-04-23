import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

// Avatar com inicial do nome
function UserAvatar({ name }) {
  const initial = name?.charAt(0)?.toUpperCase() || 'U'
  return (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
      <span className="font-cta text-xs font-bold text-white">{initial}</span>
    </div>
  )
}

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const firstName = profile?.full_name?.split(' ')[0] || null

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-heading text-lg font-bold text-bg-dark group-hover:text-primary transition-colors">
            SAFIE Tools
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="font-cta text-sm text-gray-500 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>

              {/* Menu do usuário */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200"
                >
                  <UserAvatar name={profile?.full_name} />
                  {firstName && (
                    <span className="font-cta text-sm font-medium text-gray-700">{firstName}</span>
                  )}
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                      <div className="px-4 py-2.5 border-b border-gray-50">
                        <p className="font-cta text-xs font-semibold text-gray-900 truncate">
                          {profile?.full_name || user.email}
                        </p>
                        <p className="font-body text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { setMenuOpen(false); handleSignOut() }}
                        className="w-full text-left px-4 py-2.5 font-cta text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        Sair da conta
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="font-cta text-sm text-gray-500 hover:text-primary transition-colors">
                Entrar
              </Link>
              <Button variant="primary" size="sm" onClick={() => navigate('/cadastro')}>
                Criar conta grátis
              </Button>
            </>
          )}
        </div>

        {/* Mobile: hamburguer */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <UserAvatar name={profile?.full_name} />
                <div>
                  <p className="font-cta text-sm font-semibold text-gray-900">{profile?.full_name || 'Usuário'}</p>
                  <p className="font-body text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="font-cta text-sm text-gray-600 hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleSignOut() }}
                className="font-cta text-sm text-left text-gray-500 hover:text-primary transition-colors"
              >
                Sair da conta
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-cta text-sm text-gray-600 hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Entrar
              </Link>
              <Button variant="primary" size="sm" onClick={() => { setMenuOpen(false); navigate('/cadastro') }} className="self-start">
                Criar conta grátis
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
