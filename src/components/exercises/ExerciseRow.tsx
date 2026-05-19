import { useState } from 'react'
import type { Exercise } from '../../types'
import { Modal } from '../ui/Modal'
import { ExerciseForm } from './ExerciseForm'

interface ExerciseRowProps {
  exercise: Exercise
  onUpdate: (id: string, updates: Partial<Omit<Exercise, 'id' | 'created_at'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ExerciseRow({ exercise, onUpdate, onDelete }: ExerciseRowProps) {
  const [showEdit, setShowEdit] = useState(false)

  const handleDelete = () => {
    if (confirm(`Eliminare l'esercizio "${exercise.name}"?`)) {
      onDelete(exercise.id)
    }
  }

  const metaParts: string[] = []
  if (exercise.sets) metaParts.push(`${exercise.sets} serie`)
  if (exercise.reps) metaParts.push(`${exercise.reps} rip`)
  if (exercise.weight_kg) metaParts.push(`${exercise.weight_kg} kg`)
  if (exercise.rest_seconds) metaParts.push(`${exercise.rest_seconds}s riposo`)

  return (
    <>
      <div className="flex items-start gap-3 py-3 border-b border-dark-700 last:border-0">
        <div className="w-6 h-6 rounded-md bg-dark-700 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-mono text-gray-500">{exercise.order_index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{exercise.name}</p>
          {metaParts.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">{metaParts.join(' · ')}</p>
          )}
          {exercise.notes && (
            <p className="text-xs text-gray-600 mt-0.5 italic">{exercise.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowEdit(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-neon hover:bg-neon/10 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifica esercizio">
        <ExerciseForm
          dayId={exercise.day_id}
          orderIndex={exercise.order_index}
          initial={exercise}
          onSubmit={async (updates) => {
            await onUpdate(exercise.id, updates)
            setShowEdit(false)
          }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>
    </>
  )
}
