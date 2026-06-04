import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { WorkoutSessionWithDetails, Exercise, SessionExerciseLog } from '../types'
import { Badge } from '../components/ui/Badge'
import { Navbar } from '../components/layout/Navbar'
import { BottomNav } from '../components/layout/BottomNav'
import { Button } from '../components/ui/Button'
function sortExercises(exercises: Exercise[]): Exercise[] {
  const order = { warmup: 0, exercise: 1, cooldown: 2 }
  return [...exercises].sort((a, b) => {
    const diff = order[a.exercise_type ?? 'exercise'] - order[b.exercise_type ?? 'exercise']
    return diff !== 0 ? diff : a.order_index - b.order_index
  })
}

export function HistorySessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<WorkoutSessionWithDetails | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [logs, setLogs] = useState<SessionExerciseLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!sessionId) return
    setDeleting(true)
    await supabase.from('session_exercise_logs').delete().eq('session_id', sessionId)
    await supabase.from('workout_sessions').delete().eq('id', sessionId)
    navigate('/history')
  }

  useEffect(() => {
    if (!sessionId) return

    const load = async () => {
      try {
        // Fetch session with day + plan names
        const { data: sessionData, error: sessionErr } = await supabase
          .from('workout_sessions')
          .select('*, workout_days(name, workout_plans(name))')
          .eq('id', sessionId)
          .single()
        if (sessionErr) throw sessionErr
        const s = sessionData as WorkoutSessionWithDetails
        setSession(s)

        // Fetch exercises for the day
        if (s.day_id) {
          const { data: exData, error: exErr } = await supabase
            .from('exercises')
            .select('*')
            .eq('day_id', s.day_id)
          if (exErr) throw exErr
          setExercises(sortExercises((exData ?? []) as Exercise[]))
        }

        // Fetch logs for this session
        const { data: logData, error: logErr } = await supabase
          .from('session_exercise_logs')
          .select('*')
          .eq('session_id', sessionId)
          .order('set_number', { ascending: true })
        if (logErr) throw logErr
        setLogs((logData ?? []) as SessionExerciseLog[])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Errore caricamento')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionId])

  const dateLabel = session
    ? new Date(session.completed_at).toLocaleDateString('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''
  const timeLabel = session
    ? new Date(session.completed_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    : ''

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !session) return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4 p-4">
      <p className="text-red-400">{error ?? 'Sessione non trovata'}</p>
      <Button variant="outline" onClick={() => navigate('/history')}>Torna allo storico</Button>
    </div>
  )

  const dayName = session.workout_days?.name ?? 'Allenamento'
  const planName = session.workout_days?.workout_plans?.name

  return (
    <div className="min-h-screen bg-dark-900 pb-24 md:pb-8 md:pt-14">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Session header */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1 capitalize">{dateLabel} · {timeLabel}</p>
              <h1 className="text-xl font-bold text-white mb-0.5">{dayName}</h1>
              {planName && <p className="text-sm text-gray-500">{planName}</p>}
            </div>
            {/* Delete controls */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex-shrink-0 p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Elimina sessione"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            ) : (
              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1"
                >
                  Annulla
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs font-semibold text-white bg-red-500/80 hover:bg-red-500 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {deleting ? 'Eliminando…' : 'Elimina'}
                </button>
              </div>
            )}
          </div>
          {session.notes && (
            <p className="text-sm text-gray-400 mt-3 italic border-t border-dark-700 pt-3">"{session.notes}"</p>
          )}
        </div>

        {/* Exercise logs */}
        <div className="flex flex-col gap-3">
          {exercises.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">Nessun esercizio trovato per questo giorno</p>
          )}

          {exercises.map(exercise => {
            const exLogs = logs.filter(l => l.exercise_id === exercise.id)
            const exType = exercise.exercise_type ?? 'exercise'
            const isActivity = exType === 'warmup' || exType === 'cooldown'

            return (
              <div key={exercise.id} className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    {exType === 'warmup' && <Badge variant="amber" className="text-[10px]">RISCALDAMENTO</Badge>}
                    {exType === 'cooldown' && <Badge variant="blue" className="text-[10px]">DEFATICAMENTO</Badge>}
                    <h3 className="text-sm font-semibold text-white">{exercise.name}</h3>
                  </div>
                </div>

                <div className="px-4 py-3">
                  {exLogs.length === 0 ? (
                    <p className="text-xs text-gray-600 italic">Nessun dato registrato</p>
                  ) : isActivity ? (
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span className="text-sm text-[#e0e0e0]">
                        {exLogs[0].duration_minutes != null
                          ? `${exLogs[0].duration_minutes} min`
                          : 'Completato'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      {/* Header */}
                      <div className="grid grid-cols-[32px_1fr_1fr] gap-2 mb-2">
                        <span className="text-[10px] text-gray-600 text-center">Set</span>
                        <span className="text-[10px] text-gray-600 text-center">Peso (kg)</span>
                        <span className="text-[10px] text-gray-600 text-center">Rip</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {exLogs.map(log => (
                          <div key={log.id} className="grid grid-cols-[32px_1fr_1fr] gap-2 items-center">
                            <span className="text-xs text-gray-500 text-center font-mono">{log.set_number}</span>
                            <span className="text-sm text-[#e0e0e0] text-center font-medium">
                              {log.weight_kg != null ? log.weight_kg : '—'}
                            </span>
                            <span className="text-sm text-[#e0e0e0] text-center font-medium">
                              {log.reps_done != null ? log.reps_done : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
