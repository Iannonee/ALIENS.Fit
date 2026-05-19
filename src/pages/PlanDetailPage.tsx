import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { WorkoutPlan, WorkoutDay, Exercise } from '../types'
import { Navbar } from '../components/layout/Navbar'
import { BottomNav } from '../components/layout/BottomNav'
import { DayCard } from '../components/days/DayCard'
import { DayForm } from '../components/days/DayForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

export function PlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDay, setShowAddDay] = useState(false)

  const fetchPlan = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('workout_plans')
        .select(`
          *,
          workout_days(
            *,
            exercises(*)
          )
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Sort days by order_index, exercises by order_index
      if (data.workout_days) {
        data.workout_days.sort((a: WorkoutDay, b: WorkoutDay) => a.order_index - b.order_index)
        data.workout_days.forEach((day: WorkoutDay) => {
          if (day.exercises) {
            day.exercises.sort((a: Exercise, b: Exercise) => a.order_index - b.order_index)
          }
        })
      }

      setPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleAddDay = async (planId: string, name: string, orderIndex: number) => {
    const { error } = await supabase
      .from('workout_days')
      .insert({ plan_id: planId, name, order_index: orderIndex })

    if (error) throw error
    await fetchPlan()
    setShowAddDay(false)
  }

  const handleDeleteDay = async (dayId: string) => {
    const { error } = await supabase
      .from('workout_days')
      .delete()
      .eq('id', dayId)

    if (error) throw error
    await fetchPlan()
  }

  const handleAddExercise = async (exercise: Omit<Exercise, 'id' | 'created_at'>) => {
    const { error } = await supabase
      .from('exercises')
      .insert(exercise)

    if (error) throw error
    await fetchPlan()
  }

  const handleUpdateExercise = async (exId: string, updates: Partial<Omit<Exercise, 'id' | 'created_at'>>) => {
    const { error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', exId)

    if (error) throw error
    await fetchPlan()
  }

  const handleDeleteExercise = async (exId: string) => {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exId)

    if (error) throw error
    await fetchPlan()
  }

  const days = plan?.workout_days ?? []

  return (
    <div className="min-h-screen bg-dark-900 pb-24 md:pb-8 md:pt-14">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Dashboard
        </button>

        {loading ? (
          <div className="space-y-4">
            <div className="h-6 bg-dark-800 rounded-lg w-1/2 animate-pulse" />
            <div className="h-4 bg-dark-800 rounded-lg w-3/4 animate-pulse" />
            <div className="h-20 bg-dark-800 rounded-2xl animate-pulse" />
            <div className="h-20 bg-dark-800 rounded-2xl animate-pulse" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : plan ? (
          <>
            {/* Plan header */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white">{plan.name}</h1>
                  {plan.description && (
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  )}
                </div>
                <Badge variant="neon">
                  {days.length} {days.length === 1 ? 'giorno' : 'giorni'}
                </Badge>
              </div>
            </div>

            {/* Days */}
            <div className="flex flex-col gap-3 mb-4">
              {days.map(day => (
                <DayCard
                  key={day.id}
                  day={day}
                  onDelete={handleDeleteDay}
                  onAddExercise={handleAddExercise}
                  onUpdateExercise={handleUpdateExercise}
                  onDeleteExercise={handleDeleteExercise}
                />
              ))}

              {days.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-dark-800 border border-dark-700 rounded-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-dark-700 border border-dark-600 flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <p className="text-white font-medium text-sm mb-1">Nessun giorno</p>
                  <p className="text-gray-500 text-xs max-w-[200px]">
                    Aggiungi i giorni della tua scheda di allenamento
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setShowAddDay(true)}
              className="w-full"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Aggiungi giorno
            </Button>
          </>
        ) : null}
      </div>

      <BottomNav />

      <Modal isOpen={showAddDay} onClose={() => setShowAddDay(false)} title="Nuovo giorno">
        {plan && (
          <DayForm
            planId={plan.id}
            orderIndex={days.length}
            onSubmit={handleAddDay}
            onCancel={() => setShowAddDay(false)}
          />
        )}
      </Modal>
    </div>
  )
}
