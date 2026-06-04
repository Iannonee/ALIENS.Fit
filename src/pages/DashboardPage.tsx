import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePlans } from '../hooks/usePlans'
import { PlanList } from '../components/plans/PlanList'
import { PlanForm } from '../components/plans/PlanForm'
import { Modal } from '../components/ui/Modal'
import { Navbar } from '../components/layout/Navbar'
import { BottomNav } from '../components/layout/BottomNav'
import { PdfImportModal } from '../components/plans/PdfImportModal'
import type { WorkoutPlan } from '../types'

export function DashboardPage() {
  const { user } = useAuth()
  const { plans, loading, error, createPlan, updatePlan, deletePlan, refetch } = usePlans(user)

  const [showCreate, setShowCreate] = useState(false)
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null)
  const [showPdfModal, setShowPdfModal] = useState(false)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buongiorno'
    if (hour < 18) return 'Buon pomeriggio'
    return 'Buonasera'
  }

  const handleCreate = async (name: string, description: string | null) => {
    await createPlan(name, description)
    setShowCreate(false)
  }

  const handleUpdate = async (name: string, description: string | null) => {
    if (!editingPlan) return
    await updatePlan(editingPlan.id, name, description)
    setEditingPlan(null)
  }

  const handleDelete = async (id: string) => {
    await deletePlan(id)
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-20 md:pb-0 md:pt-14">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-sm text-gray-500">{greeting()},</p>
              <h1 className="text-xl font-bold text-white truncate max-w-[220px]">
                {user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'Alien'}
              </h1>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
            <p className="text-2xl font-bold text-neon">{plans.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Schede totali</p>
          </div>
          <button
            onClick={() => setShowPdfModal(true)}
            className="bg-dark-800 border border-dark-700 hover:border-neon/30 rounded-2xl p-4 text-left transition-colors group"
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white group-hover:text-neon transition-colors">Importa PDF</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-medium">
                Premium
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Carica la tua scheda</p>
          </button>
        </div>

        {/* Plans section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Le tue schede</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon text-dark-900 text-sm font-semibold hover:brightness-110 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuova scheda
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-dark-700 rounded-lg w-2/3 mb-3" />
                <div className="h-3 bg-dark-700 rounded-lg w-full mb-4" />
                <div className="h-5 bg-dark-700 rounded-full w-16" />
              </div>
            ))}
          </div>
        ) : (
          <PlanList
            plans={plans}
            onEdit={setEditingPlan}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-2xl bg-neon text-dark-900 flex items-center justify-center shadow-neon hover:brightness-110 transition-all active:scale-95 z-30"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <BottomNav />

      {/* Modals */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuova scheda">
        <PlanForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal isOpen={!!editingPlan} onClose={() => setEditingPlan(null)} title="Modifica scheda">
        {editingPlan && (
          <PlanForm
            initial={editingPlan}
            onSubmit={handleUpdate}
            onCancel={() => setEditingPlan(null)}
          />
        )}
      </Modal>

      <Modal isOpen={showPdfModal} onClose={() => setShowPdfModal(false)} title="Importa da PDF">
        <PdfImportModal
          user={user}
          onSuccess={refetch}
          onClose={() => setShowPdfModal(false)}
        />
      </Modal>
    </div>
  )
}
