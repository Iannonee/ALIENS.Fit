import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSessionLogs } from '../hooks/useSessionLogs'
import type { WorkoutDay, Exercise } from '../types'
import { Timer } from '../components/ui/Timer'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Navbar } from '../components/layout/Navbar'

function sortExercises(exercises: Exercise[]): Exercise[] {
  const order = { warmup: 0, exercise: 1, cooldown: 2 }
  return [...exercises].sort((a, b) => {
    const diff = order[a.exercise_type ?? 'exercise'] - order[b.exercise_type ?? 'exercise']
    return diff !== 0 ? diff : a.order_index - b.order_index
  })
}

export function WorkoutSessionPage() {
  const { dayId } = useParams<{ dayId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [day, setDay] = useState<WorkoutDay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const sessionCreated = useRef(false)

  // set inputs: key = `${exerciseId}-${setNum}`
  const [setInputs, setSetInputs] = useState<Record<string, { weight: string; reps: string }>>({})
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set())
  // warmup/cooldown duration inputs: key = exerciseId
  const [durationInputs, setDurationInputs] = useState<Record<string, string>>({})
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set())

  const [activeTimer, setActiveTimer] = useState<{ exerciseId: string; seconds: number } | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [sessionNotes, setSessionNotes] = useState('')

  const { addLog, saving: logSaving } = useSessionLogs(sessionId)

  // Fetch day data
  useEffect(() => {
    if (!dayId) return
    supabase
      .from('workout_days')
      .select('*, exercises(*)')
      .eq('id', dayId)
      .single()
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return }
        if (data?.exercises) {
          data.exercises = sortExercises(data.exercises)
        }
        setDay(data)
        setLoading(false)
      })
  }, [dayId])

  // Create session immediately on mount (once)
  useEffect(() => {
    if (!user || !dayId || sessionCreated.current) return
    sessionCreated.current = true
    supabase
      .from('workout_sessions')
      .insert({ user_id: user.id, day_id: dayId, completed_at: new Date().toISOString() })
      .select('id')
      .single()
      .then(({ data }) => { if (data) setSessionId(data.id) })
  }, [user, dayId])

  const exercises = day?.exercises ?? []

  const getSetKey = (exId: string, setNum: number) => `${exId}-${setNum}`

  const totalUnits = exercises.length

  const doneUnits = exercises.filter(ex => {
    if (ex.exercise_type !== 'exercise') return completedActivities.has(ex.id)
    const plannedSets = ex.sets ?? 3
    return Array.from({ length: plannedSets }, (_, i) =>
      completedSets.has(getSetKey(ex.id, i + 1))
    ).every(Boolean)
  }).length

  const progress = totalUnits > 0 ? (doneUnits / totalUnits) * 100 : 0

  const updateSetInput = (exId: string, setNum: number, field: 'weight' | 'reps', val: string) => {
    const key = getSetKey(exId, setNum)
    setSetInputs(prev => ({ ...prev, [key]: { ...{ weight: '', reps: '' }, ...prev[key], [field]: val } }))
  }

  const handleCompleteSet = async (exercise: Exercise, setNum: number) => {
    const key = getSetKey(exercise.id, setNum)
    const input = setInputs[key] ?? {}
    await addLog({
      exercise_id: exercise.id,
      set_number: setNum,
      reps_done: input.reps ? parseInt(input.reps) : null,
      weight_kg: input.weight ? parseFloat(input.weight) : null,
      duration_minutes: null,
      notes: null,
    })
    setCompletedSets(prev => new Set(prev).add(key))
  }

  const handleCompleteActivity = async (exercise: Exercise) => {
    const dur = durationInputs[exercise.id]
    await addLog({
      exercise_id: exercise.id,
      set_number: 1,
      reps_done: null,
      weight_kg: null,
      duration_minutes: dur ? parseFloat(dur) : null,
      notes: null,
    })
    setCompletedActivities(prev => new Set(prev).add(exercise.id))
  }

  const handleFinish = async () => {
    // Update session notes
    if (sessionId && sessionNotes.trim()) {
      await supabase
        .from('workout_sessions')
        .update({ notes: sessionNotes.trim() })
        .eq('id', sessionId)
    }
    navigate('/history')
  }

  const inputClass = 'bg-dark-700 border border-dark-600 rounded-lg text-white text-sm px-3 py-2 focus:border-neon focus:outline-none w-full text-center placeholder-gray-600'

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !day) return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4 p-4">
      <p className="text-red-400">{error ?? 'Giorno non trovato'}</p>
      <Button variant="outline" onClick={() => navigate('/dashboard')}>Torna alla home</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-900 pb-10 md:pt-14">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                <span className="text-xs text-neon font-medium uppercase tracking-wider">Sessione attiva</span>
              </div>
              <h1 className="text-xl font-bold text-white">{day.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-neon">{doneUnits}/{totalUnits}</p>
              <p className="text-xs text-gray-500">completati</p>
            </div>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-neon rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Exercises */}
        <div className="flex flex-col gap-4 mb-6">
          {exercises.map((exercise) => {
            const exType = exercise.exercise_type ?? 'exercise'
            const isActivity = exType === 'warmup' || exType === 'cooldown'
            const actDone = completedActivities.has(exercise.id)
            const plannedSets = exercise.sets ?? 3

            return (
              <div key={exercise.id} className={`bg-dark-800 border rounded-2xl overflow-hidden transition-all ${
                isActivity
                  ? actDone ? 'border-blue-500/40' : 'border-dark-700'
                  : 'border-dark-700'
              }`}>
                {/* Exercise header */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {exType === 'warmup' && <Badge variant="amber" className="text-[10px]">RISCALDAMENTO</Badge>}
                    {exType === 'cooldown' && <Badge variant="blue" className="text-[10px]">DEFATICAMENTO</Badge>}
                    <h3 className="font-semibold text-white text-sm">{exercise.name}</h3>
                    {actDone && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  {/* Planned info */}
                  {exType === 'exercise' && (
                    <p className="text-xs text-gray-500">
                      {[
                        exercise.sets && `${exercise.sets} serie`,
                        exercise.reps && `${exercise.reps} rip`,
                        exercise.weight_kg && `${exercise.weight_kg} kg`,
                        exercise.rest_seconds && `${exercise.rest_seconds}s riposo`,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {isActivity && exercise.weight_kg && (
                    <p className="text-xs text-gray-500">{exercise.weight_kg} min pianificati{exercise.reps ? ` · ${exercise.reps}` : ''}</p>
                  )}
                </div>

                {/* Set tracker for exercises */}
                {exType === 'exercise' && (
                  <div className="px-4 pb-4">
                    {/* Column headers */}
                    <div className="grid grid-cols-[28px_1fr_1fr_44px] gap-2 mb-2 px-1">
                      <span className="text-[10px] text-gray-600 text-center">#</span>
                      <span className="text-[10px] text-gray-600 text-center">Peso (kg)</span>
                      <span className="text-[10px] text-gray-600 text-center">Rip</span>
                      <span />
                    </div>
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: plannedSets }, (_, i) => {
                        const setNum = i + 1
                        const key = getSetKey(exercise.id, setNum)
                        const done = completedSets.has(key)
                        const input = setInputs[key] ?? { weight: '', reps: '' }

                        return (
                          <div key={setNum} className={`grid grid-cols-[28px_1fr_1fr_44px] gap-2 items-center rounded-xl px-1 py-1 transition-colors ${done ? 'bg-neon/5' : ''}`}>
                            <span className={`text-xs font-mono text-center ${done ? 'text-neon' : 'text-gray-500'}`}>{setNum}</span>
                            {done ? (
                              <>
                                <span className="text-sm text-neon text-center font-medium">{input.weight || '—'}</span>
                                <span className="text-sm text-neon text-center font-medium">{input.reps || '—'}</span>
                              </>
                            ) : (
                              <>
                                <input
                                  type="number"
                                  value={input.weight}
                                  onChange={e => updateSetInput(exercise.id, setNum, 'weight', e.target.value)}
                                  placeholder={exercise.weight_kg?.toString() ?? 'kg'}
                                  min="0" step="0.5"
                                  className={inputClass}
                                />
                                <input
                                  type="number"
                                  value={input.reps}
                                  onChange={e => updateSetInput(exercise.id, setNum, 'reps', e.target.value)}
                                  placeholder={exercise.reps?.split('-')[0] ?? 'rip'}
                                  min="0"
                                  className={inputClass}
                                />
                              </>
                            )}
                            <button
                              onClick={() => !done && handleCompleteSet(exercise, setNum)}
                              disabled={done || logSaving}
                              className={`w-10 h-9 rounded-lg flex items-center justify-center transition-all ${
                                done
                                  ? 'bg-neon/20 text-neon cursor-default'
                                  : 'bg-dark-700 text-gray-400 hover:bg-neon hover:text-dark-900 active:scale-95'
                              }`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {/* Rest timer */}
                    {exercise.rest_seconds && (
                      <button
                        onClick={() => { setActiveTimer({ exerciseId: exercise.id, seconds: exercise.rest_seconds! }); setShowTimer(true) }}
                        className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-600 text-xs text-gray-400 hover:border-neon/40 hover:text-neon transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Timer riposo {exercise.rest_seconds}s
                      </button>
                    )}
                  </div>
                )}

                {/* Duration input for warmup/cooldown */}
                {isActivity && (
                  <div className="px-4 pb-4">
                    {actDone ? (
                      <p className="text-sm text-neon font-medium">
                        ✓ {durationInputs[exercise.id] ? `${durationInputs[exercise.id]} min` : 'Completato'}
                      </p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">Durata effettiva (min)</label>
                          <input
                            type="number"
                            value={durationInputs[exercise.id] ?? ''}
                            onChange={e => setDurationInputs(prev => ({ ...prev, [exercise.id]: e.target.value }))}
                            placeholder={exercise.weight_kg?.toString() ?? '10'}
                            min="0" step="1"
                            className={inputClass}
                          />
                        </div>
                        <button
                          onClick={() => handleCompleteActivity(exercise)}
                          disabled={logSaving}
                          className="mt-5 px-4 py-2 bg-neon text-dark-900 font-semibold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                        >
                          Fatto
                        </button>
                      </div>
                    )}
                  </div>
                )}
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

        <Button variant="primary" size="lg" onClick={handleFinish} className="w-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Sessione completata
        </Button>
      </div>

      {/* Timer Modal */}
      <Modal isOpen={showTimer} onClose={() => setShowTimer(false)} title={`Timer riposo · ${activeTimer?.seconds ?? 90}s`}>
        <div className="flex justify-center py-4">
          <Timer seconds={activeTimer?.seconds ?? 90} onComplete={() => setTimeout(() => setShowTimer(false), 500)} />
        </div>
      </Modal>
    </div>
  )
}
