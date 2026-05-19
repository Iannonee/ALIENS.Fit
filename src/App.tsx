import { Component, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { isSupabaseConfigured } from './lib/supabase'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { PlanDetailPage } from './pages/PlanDetailPage'
import { WorkoutSessionPage } from './pages/WorkoutSessionPage'
import { PremiumPage } from './pages/PremiumPage'
import { HistoryPage } from './pages/HistoryPage'
import { HistorySessionPage } from './pages/HistorySessionPage'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <img src="/logo.svg" alt="AliensFit" className="w-10 h-10 mb-1" />
          <h1 className="text-xl font-bold text-white mb-2">AliensFit</h1>
          <div className="bg-dark-800 border border-red-500/30 rounded-2xl p-5 max-w-md w-full text-left mt-2">
            <p className="text-red-400 text-sm font-semibold mb-2">Errore applicazione</p>
            <p className="text-gray-500 text-xs font-mono break-all">{(this.state.error as Error).message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-neon text-dark-900 font-semibold rounded-xl text-sm hover:brightness-110"
          >
            Ricarica
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function SetupBanner() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-center">
      <img src="/logo.svg" alt="AliensFit" className="w-14 h-14 mb-1" />
      <h1 className="text-2xl font-bold text-white mb-2">AliensFit</h1>
      <div className="mt-4 bg-dark-800 border border-yellow-500/30 rounded-2xl p-6 max-w-md w-full text-left">
        <p className="text-yellow-400 font-semibold text-sm mb-3">⚠ Configurazione richiesta</p>
        <p className="text-gray-400 text-sm mb-4">
          Le variabili d'ambiente Supabase non sono configurate. Aggiungi su Netlify:
        </p>
        <div className="bg-dark-700 rounded-xl p-3 font-mono text-xs text-neon space-y-1">
          <div>VITE_SUPABASE_URL=...</div>
          <div>VITE_SUPABASE_ANON_KEY=...</div>
        </div>
        <p className="text-gray-600 text-xs mt-3">
          Trovi i valori su supabase.com → Settings → API
        </p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
          <p className="text-[#e0e0e0] text-sm">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AuthRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function LandingRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />
  return <LandingPage />
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupBanner />

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <AuthRoute>
              <AuthPage />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <AuthPage />
            </AuthRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <AuthPage />
            </AuthRoute>
          }
        />
        <Route
          path="/plan/:id"
          element={
            <ProtectedRoute>
              <PlanDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session/:dayId"
          element={
            <ProtectedRoute>
              <WorkoutSessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/premium"
          element={
            <ProtectedRoute>
              <PremiumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history/:sessionId"
          element={
            <ProtectedRoute>
              <HistorySessionPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
