import { Link } from 'react-router-dom'
import type { WorkoutPlan } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface PlanCardProps {
  plan: WorkoutPlan
  onEdit: (plan: WorkoutPlan) => void
  onDelete: (id: string) => void
}

export function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
  const dayCount = plan.workout_days?.length ?? 0

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(`Eliminare la scheda "${plan.name}"?`)) {
      onDelete(plan.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit(plan)
  }

  return (
    <Link to={`/plan/${plan.id}`} className="block group">
      <div className="bg-dark-800 border border-dark-700 hover:border-neon/30 rounded-2xl p-5 transition-all duration-200 group-hover:shadow-[0_0_20px_#39ff1410]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base truncate">{plan.name}</h3>
            {plan.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{plan.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleEdit}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-neon hover:bg-neon/10 transition-colors"
              title="Modifica"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Elimina"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Badge variant={dayCount > 0 ? 'neon' : 'gray'}>
            {dayCount} {dayCount === 1 ? 'giorno' : 'giorni'}
          </Badge>

          <Button variant="outline" size="sm" className="pointer-events-none">
            Apri
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Button>
        </div>
      </div>
    </Link>
  )
}
