import { useState } from 'react'
import { Button } from '../ui/Button'

interface DayFormProps {
  planId: string
  orderIndex: number
  onSubmit: (planId: string, name: string, orderIndex: number) => Promise<void>
  onCancel: () => void
}

export function DayForm({ planId, orderIndex, onSubmit, onCancel }: DayFormProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputClass =
    'w-full bg-dark-700 border border-dark-600 rounded-xl text-white px-4 py-3 focus:border-neon focus:outline-none transition-colors placeholder-gray-600 text-sm'

  const suggestions = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica',
    'Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      await onSubmit(planId, name.trim(), orderIndex)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Nome giorno <span className="text-neon">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="es. Lunedì - Push"
          required
          className={inputClass}
          autoFocus
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setName(s)}
            className="px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-600 text-xs text-gray-400 hover:border-neon/40 hover:text-neon transition-colors"
          >
            {s}
          </button>
        ))}
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
          ) : 'Aggiungi giorno'}
        </Button>
      </div>
    </form>
  )
}
