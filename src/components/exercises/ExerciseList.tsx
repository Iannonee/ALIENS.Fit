import type { Exercise } from '../../types'
import { ExerciseRow } from './ExerciseRow'

interface ExerciseListProps {
  exercises: Exercise[]
  onUpdate: (id: string, updates: Partial<Omit<Exercise, 'id' | 'created_at'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ExerciseList({ exercises, onUpdate, onDelete }: ExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-gray-600">Nessun esercizio. Aggiungine uno!</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-dark-700/50 border border-dark-600 divide-y divide-dark-700 overflow-hidden">
      {exercises.map(exercise => (
        <div key={exercise.id} className="px-3">
          <ExerciseRow
            exercise={exercise}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  )
}
