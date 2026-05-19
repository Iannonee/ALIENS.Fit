import { useState } from 'react'
import type { Exercise } from '../../types'
import { Button } from '../ui/Button'

interface ExerciseFormProps {
  dayId: string
  orderIndex: number
  initial?: Exercise
  onSubmit: (exercise: Omit<Exercise, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

export function ExerciseForm({ dayId, orderIndex, initial, onSubmit, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [sets, setSets] = useState(initial?.sets?.toString() ?? '')
  const [reps, setReps] = useState(initial?.reps ?? '')
  const [rest, setRest] = useState(initial?.rest_seconds?.toString() ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputClass =
    'w-full bg-dark-700 border border-dark-600 rounded-xl text-white px-4 py-3 focus:border-neon focus:outline-none transition-colors placeholder-gray-600 text-sm'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      await onSubmit({
        day_id: dayId,
        name: name.trim(),
        sets: sets ? parseInt(sets) : null,
        reps: reps.trim() || null,
        rest_seconds: rest ? parseInt(rest) : null,
        notes: notes.trim() || null,
        order_index: orderIndex,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Nome esercizio <span className="text-neon">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="es. Panca Piana"
          required
          className={inputClass}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Serie</label>
          <input
            type="number"
            value={sets}
            onChange={e => setSets(e.target.value)}
            placeholder="4"
            min="1"
            max="99"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Ripetizioni</label>
          <input
            type="text"
            value={reps}
            onChange={e => setReps(e.target.value)}
            placeholder="8-12"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Riposo (s)</label>
          <input
            type="number"
            value={rest}
            onChange={e => setRest(e.target.value)}
            placeholder="90"
            min="0"
            max="600"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Note <span className="text-gray-600">(opzionale)</span>
        </label>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="es. Presa larga, focus sul petto"
          className={inputClass}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="ghost" size="md" type="button" onClick={onCancel} className="flex-1">
          Annulla
        </Button>
        <Button variant="primary" size="md" type="submit" disabled={loading || !name.trim()} className="flex-1">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              Salvataggio...
            </span>
          ) : initial ? 'Salva' : 'Aggiungi'}
        </Button>
      </div>
    </form>
  )
}
