import { useState } from 'react'
import { Button } from '../ui/Button'
import type { WorkoutPlan } from '../../types'

interface PlanFormProps {
  initial?: WorkoutPlan
  onSubmit: (name: string, description: string | null) => Promise<void>
  onCancel: () => void
}

export function PlanForm({ initial, onSubmit, onCancel }: PlanFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
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
      await onSubmit(name.trim(), description.trim() || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Nome scheda <span className="text-neon">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="es. Push Pull Legs"
          required
          className={inputClass}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Descrizione <span className="text-gray-600">(opzionale)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Breve descrizione della scheda..."
          rows={3}
          className={`${inputClass} resize-none`}
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
          ) : initial ? 'Salva modifiche' : 'Crea scheda'}
        </Button>
      </div>
    </form>
  )
}
