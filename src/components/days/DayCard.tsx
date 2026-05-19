import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WorkoutDay, Exercise } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ExerciseList } from '../exercises/ExerciseList'
import { ExerciseForm } from '../exercises/ExerciseForm'
import { Modal } from '../ui/Modal'

interface DayCardProps {
  day: WorkoutDay
  onDelete: (id: string) => void
  onAddExercise: (exercise: Omit<Exercise, 'id' | 'created_at'>) => Promise<void>
  onUpdateExercise: (id: string, updates: Partial<Omit<Exercise, 'id' | 'created_at'>>) => Promise<void>
  onDeleteExercise: (id: string) => Promise<void>
}

type AddType = 'exercise' | 'warmup' | 'cooldown'

export function DayCard({
  day,
  onDelete,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
}: DayCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [addType, setAddType] = useState<AddType | null>(null)
  const navigate = useNavigate()

  const rawExercises = day.exercises ?? []

  // Sort: warmups first, then exercises, then cooldowns
  const exercises = [...rawExercises].sort((a, b) => {
    const typeOrder = { warmup: 0, exercise: 1, cooldown: 2 }
    const aType = a.exercise_type ?? 'exercise'
    const bType = b.exercise_type ?? 'exercise'
    const typeDiff = typeOrder[aType] - typeOrder[bType]
    if (typeDiff !== 0) return typeDiff
    return a.order_index - b.order_index
  })

  const exCount = exercises.length

  const handleDelete = () => {
    if (confirm(`Eliminare il giorno "${day.name}"?`)) {
      onDelete(day.id)
    }
  }

  const handleSelectType = (t: AddType) => {
    setAddType(t)
    setShowTypeSelector(false)
  }

  const formModalTitle =
    addType === 'warmup'
      ? 'Nuovo riscaldamento'
      : addType === 'cooldown'
        ? 'Nuovo defaticamento'
        : 'Nuovo esercizio'

  return (
    <div className={`bg-dark-800 border rounded-2xl overflow-hidden transition-all duration-200 ${
      expanded ? 'border-neon/40 shadow-[0_0_20px_#39ff1410]' : 'border-dark-700'
    }`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          expanded ? 'bg-neon text-dark-900' : 'bg-dark-700 text-gray-400'
        }`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm">{day.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={exCount > 0 ? 'neon' : 'gray'}>
              {exCount} {exCount === 1 ? 'esercizio' : 'esercizi'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/session/${day.id}`)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neon/10 text-neon text-xs font-medium hover:bg-neon/20 transition-colors"
            title="Inizia allenamento"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Inizia
          </button>
          <button
            onClick={handleDelete}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
          <div className={`w-5 h-5 flex items-center justify-center text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-dark-700 px-4 pb-4 pt-3">
          <ExerciseList
            exercises={exercises}
            onUpdate={onUpdateExercise}
            onDelete={onDeleteExercise}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTypeSelector(true)}
            className="mt-3 w-full"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Aggiungi esercizio
          </Button>
        </div>
      )}

      {/* Type selector modal */}
      <Modal
        isOpen={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        title="Tipo di attività"
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-400 mb-1">Seleziona il tipo di attività da aggiungere:</p>
          <button
            onClick={() => handleSelectType('warmup')}
            className="flex items-center gap-3 p-4 rounded-xl bg-dark-700 border border-dark-600 hover:border-amber-500/40 hover:bg-amber-500/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-400">Riscaldamento</p>
              <p className="text-xs text-gray-500">Attività di preparazione all'allenamento</p>
            </div>
          </button>
          <button
            onClick={() => handleSelectType('exercise')}
            className="flex items-center gap-3 p-4 rounded-xl bg-dark-700 border border-dark-600 hover:border-neon/40 hover:bg-neon/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-neon/20 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2">
                <path d="M6.5 6.5h11"/>
                <path d="M6.5 17.5h11"/>
                <path d="M3 9.5h18"/>
                <path d="M3 14.5h18"/>
                <path d="M2 9.5v5"/>
                <path d="M22 9.5v5"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-neon">Esercizio</p>
              <p className="text-xs text-gray-500">Serie, ripetizioni e peso</p>
            </div>
          </button>
          <button
            onClick={() => handleSelectType('cooldown')}
            className="flex items-center gap-3 p-4 rounded-xl bg-dark-700 border border-dark-600 hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
                <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
                <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-400">Defaticamento</p>
              <p className="text-xs text-gray-500">Attività di recupero post-allenamento</p>
            </div>
          </button>
        </div>
      </Modal>

      {/* Exercise form modal */}
      <Modal
        isOpen={addType !== null}
        onClose={() => setAddType(null)}
        title={formModalTitle}
      >
        {addType !== null && (
          <ExerciseForm
            dayId={day.id}
            orderIndex={rawExercises.length}
            type={addType}
            onSubmit={async (ex) => {
              await onAddExercise(ex)
              setAddType(null)
            }}
            onCancel={() => setAddType(null)}
          />
        )}
      </Modal>
    </div>
  )
}
