import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { WorkoutDay, Exercise } from '../types'
import { Timer } from '../components/ui/Timer'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Navbar } from '../components/layout/Navbar'

export function WorkoutSessionPage() {
  const { dayId } = useParams<{ dayId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [day, setDay] = useState<WorkoutDay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [activeTimer, setActiveTimer] = useState<{ exerciseId: string; seconds: number } | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [sessionNotes, setSessionNotes] = useState('')

  useEffect(() => {
    const fetchDay = async () => {
      if (!dayId) return

      try {
        const { data, error: fetchError } = await supabase
          .from('workout_days')
          .select('*, exercises(*)')
          .eq('id', dayId)
          .single()

        if (fetchError) throw fetchError

        if (data.exercises) {
          data.exercises.sort((a: Exercise, b: Exercise) => a.order_index - b.order_index)
        }

        setDay(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento')
      } finally {
        setLoading(false)
      }
    }

    fetchDay()
  }, [dayId])

  const exercises = day?.exercises ?? []
  const completedCount = checked.size
  const totalCount = exercises.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleStartTimer = (exercise: Exercise) => {
    const seconds = exercise.rest_seconds ?? 90
    setActiveTimer({ exerciseId: exercise.id, seconds })
    setShowTimer(true)
  }

  const handleComplete = async () => {
    if (!user || !dayId) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          day_id: dayId,
          notes: sessionNotes.trim() || null,
          completed_at: new Date().toISOString(),
        })

      if (error) throw error
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !day) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-red-400">{error ?? 'Giorno non trovato'}</p>
        <Button variant="outline" onClick={() => navigate('/')}>Torna alla home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-8 md:pt-14">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Indietro
        </button>

        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                <span className="text-xs text-neon font-medium uppercase tracking-wider">Sessione attiva</span>
              </div>
              <h1 className="text-xl font-bold text-white">{day.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-neon">{completedCount}/{totalCount}</p>
              <p className="text-xs text-gray-500">esercizi</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-neon rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex flex-col gap-3 mb-6">
          {exercises.map((exercise, index) => {
            const isChecked = checked.has(exercise.id)
            const metaParts: string[] = []
            if (exercise.sets) metaParts.push(`${exercise.sets} serie`)
            if (exercise.reps) metaParts.push(`${exercise.reps} rip`)

            return (
              <div
                key={exercise.id}
                className={`bg-dark-800 border rounded-2xl p-4 transition-all duration-200 ${
                  isChecked
                    ? 'border-neon/40 bg-neon/5'
                    : 'border-dark-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleCheck(exercise.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isChecked
                        ? 'bg-neon border-neon'
                        : 'border-dark-600 hover:border-neon/50'
                    }`}
                  >
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-mono">{String(index + 1).padStart(2, '0')}</span>
                      <h3 className={`font-semibold text-sm ${isChecked ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {exercise.name}
                      </h3>
                    </div>
                    {metaParts.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5 ml-6">{metaParts.join(' · ')}</p>
                    )}
                    {exercise.notes && (
                      <p className="text-xs text-gray-600 mt-0.5 ml-6 italic">{exercise.notes}</p>
                    )}
                  </div>

                  {exercise.rest_seconds && (
                    <button
                      onClick={() => handleStartTimer(exercise)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-700 border border-dark-600 text-xs text-gray-400 hover:border-neon/40 hover:text-neon transition-colors shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {exercise.rest_seconds}s
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Session notes */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Note sessione <span className="text-gray-600">(opzionale)</span>
          </label>
          <textarea
            value={sessionNotes}
            onChange={e => setSessionNotes(e.target.value)}
            placeholder="Come ti sei sentito? Nuovi record?"
            rows={3}
            className="w-full bg-dark-800 border border-dark-700 rounded-xl text-white px-4 py-3 focus:border-neon focus:outline-none transition-colors placeholder-gray-600 text-sm resize-none"
          />
        </div>

        {/* Complete button */}
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowComplete(true)}
          className="w-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Sessione completata
        </Button>
      </div>

      {/* Timer Modal */}
      <Modal
        isOpen={showTimer}
        onClose={() => setShowTimer(false)}
        title={`Timer riposo · ${activeTimer?.seconds ?? 90}s`}
      >
        <div className="flex justify-center py-4">
          <Timer
            seconds={activeTimer?.seconds ?? 90}
            onComplete={() => {
              setTimeout(() => setShowTimer(false), 500)
            }}
          />
        </div>
      </Modal>

      {/* Confirm complete modal */}
      <Modal
        isOpen={showComplete}
        onClose={() => setShowComplete(false)}
        title="Completa sessione"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-400">
            Hai completato {completedCount} su {totalCount} esercizi.
            Vuoi salvare la sessione?
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowComplete(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleComplete}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                  Salvataggio...
                </span>
              ) : 'Salva e chiudi'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
