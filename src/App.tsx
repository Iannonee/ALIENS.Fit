import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { isSupabaseConfigured } from './lib/supabase'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { PlanDetailPage } from './pages/PlanDetailPage'
import { WorkoutSessionPage } from './pages/WorkoutSessionPage'
import { PremiumPage } from './pages/PremiumPage'

function SetupBanner() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-neon flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">ALIENS<span className="text-neon">.Fit</span></h1>
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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

  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupBanner />

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
