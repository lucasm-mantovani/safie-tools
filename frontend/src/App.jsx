import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import PageWrapper from './components/layout/PageWrapper'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CompleteProfile from './pages/CompleteProfile'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import AuthCallback from './pages/AuthCallback'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EquityCalculator from './pages/tools/equity-calculator'
import TaxBetter from './pages/tools/tax-better'
import LaborRisk from './pages/tools/labor-risk'
import FastDueDiligence from './pages/tools/fast-due-diligence'
import LitigationCost from './pages/tools/litigation-cost'
import PartnersCash from './pages/tools/partners-cash'

// Rota protegida — redireciona para /login se não autenticado
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

// Redireciona usuários autenticados para longe das páginas públicas (login/cadastro)
function PublicOnlyRoute({ children }) {
  const { user, loading, needsProfileCompletion } = useAuth()
  if (loading) return <LoadingScreen />
  const isOAuthUser = user?.app_metadata?.provider !== 'email'
  if (user && needsProfileCompletion && isOAuthUser) return <Navigate to="/completar-perfil" replace />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

// Guard específico para OAuth: redireciona quem tem perfil para fora do /completar-perfil
function CompleteProfileRoute({ children }) {
  const { user, loading, needsProfileCompletion } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (!needsProfileCompletion) return <Navigate to="/dashboard" replace />
  return children
}

// Watcher global — redireciona usuários OAuth que acabaram de fazer login sem perfil
function OAuthGuard() {
  const { user, needsProfileCompletion } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const isOAuthUser = user?.app_metadata?.provider !== 'email'
    if (needsProfileCompletion && isOAuthUser) {
      navigate('/completar-perfil', { replace: true })
    }
  }, [needsProfileCompletion, user, navigate])

  return null
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-safie-light">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-sm text-gray-500">Carregando...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <OAuthGuard />
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />

        {/* Páginas só para não-autenticados */}
        <Route
          path="/login"
          element={<PublicOnlyRoute><PageWrapper><Login /></PageWrapper></PublicOnlyRoute>}
        />
        <Route
          path="/cadastro"
          element={<PublicOnlyRoute><PageWrapper><Register /></PageWrapper></PublicOnlyRoute>}
        />

        {/* Completar perfil — só para usuários OAuth sem perfil */}
        <Route
          path="/completar-perfil"
          element={<CompleteProfileRoute><PageWrapper><CompleteProfile /></PageWrapper></CompleteProfileRoute>}
        />

        {/* Recuperação de senha */}
        <Route
          path="/esqueci-senha"
          element={<PublicOnlyRoute><PageWrapper><ForgotPassword /></PageWrapper></PublicOnlyRoute>}
        />
        <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />

        {/* Callback de OAuth e confirmação de e-mail */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Área logada */}
        <Route
          path="/dashboard"
          element={<PrivateRoute><PageWrapper><Dashboard /></PageWrapper></PrivateRoute>}
        />
        <Route
          path="/perfil"
          element={<PrivateRoute><PageWrapper><Profile /></PageWrapper></PrivateRoute>}
        />

        {/* Ferramentas */}
        <Route
          path="/ferramentas/equity-calculator"
          element={<PrivateRoute><PageWrapper><EquityCalculator /></PageWrapper></PrivateRoute>}
        />
        <Route
          path="/ferramentas/tax-better"
          element={<PrivateRoute><PageWrapper><TaxBetter /></PageWrapper></PrivateRoute>}
        />
        <Route
          path="/ferramentas/labor-risk"
          element={<PrivateRoute><PageWrapper><LaborRisk /></PageWrapper></PrivateRoute>}
        />
        <Route
          path="/ferramentas/fast-due-diligence"
          element={<PrivateRoute><PageWrapper><FastDueDiligence /></PageWrapper></PrivateRoute>}
        />
        <Route
          path="/ferramentas/litigation-cost"
          element={<PrivateRoute><PageWrapper><LitigationCost /></PageWrapper></PrivateRoute>}
        />
        <Route
          path="/ferramentas/partners-cash"
          element={<PrivateRoute><PageWrapper><PartnersCash /></PageWrapper></PrivateRoute>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
