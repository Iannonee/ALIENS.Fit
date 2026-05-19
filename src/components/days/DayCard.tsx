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

export function DayCard({
  day,
  onDelete,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
}: DayCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const navigate = useNavigate()

  const exercises = day.exercises ?? []
  const exCount = exercises.length

  const handleDelete = () => {
    if (confirm(`Eliminare il giorno "${day.name}"?`)) {
      onDelete(day.id)
    }
  }

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
            onClick={() => setShowAddExercise(true)}
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

      <Modal
        isOpen={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        title="Nuovo esercizio"
      >
        <ExerciseForm
          dayId={day.id}
          orderIndex={exercises.length}
          onSubmit={async (ex) => {
            await onAddExercise(ex)
            setShowAddExercise(false)
          }}
          onCancel={() => setShowAddExercise(false)}
        />
      </Modal>
    </div>
  )
}
