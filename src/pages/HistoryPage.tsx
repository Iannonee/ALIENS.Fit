import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useHistory } from '../hooks/useHistory'
import { Navbar } from '../components/layout/Navbar'
import { BottomNav } from '../components/layout/BottomNav'
import type { WorkoutSessionWithDetails } from '../types'

function SessionCard({ session, onClick }: { session: WorkoutSessionWithDetails; onClick: () => void }) {
  const time = new Date(session.completed_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const dayName = session.workout_days?.name ?? 'Allenamento'
  const planName = session.workout_days?.workout_plans?.name

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 bg-dark-800 border border-dark-700 hover:border-neon/30 rounded-2xl px-5 py-4 text-left transition-all hover:shadow-[0_0_16px_#39ff1410] group"
    >
      <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{dayName}</p>
        {planName && <p className="text-xs text-gray-500 truncate">{planName}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-gray-500">{time}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" className="group-hover:stroke-neon transition-colors">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
    </button>
  )
}

export function HistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { grouped, loading, error } = useHistory(user)
  const dates = Object.keys(grouped)

  return (
    <div className="min-h-screen bg-dark-900 pb-24 md:pb-8 md:pt-14">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-6">

        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Home
        </button>

        <h1 className="text-xl font-bold text-white mb-6">Storico allenamenti</h1>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-dark-700 rounded w-1/2 mb-2" />
                <div className="h-3 bg-dark-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && dates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 className="text-white font-semibold text-base mb-1">Nessun allenamento</h3>
            <p className="text-gray-500 text-sm max-w-[220px]">Completa il tuo primo allenamento per vederlo qui</p>
          </div>
        )}

        {!loading && dates.map(date => (
          <div key={date} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{date}</h2>
            <div className="flex flex-col gap-2">
              {grouped[date].map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => navigate(`/history/${session.id}`)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}
