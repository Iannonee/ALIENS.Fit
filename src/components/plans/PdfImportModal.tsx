import { useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { usePdfImport } from '../../hooks/usePdfImport'
import { Button } from '../ui/Button'

interface Props {
  user: User | null
  onSuccess: () => void
  onClose: () => void
}

export function PdfImportModal({ user, onSuccess, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    step, file, workouts, selected, saveProgress, error,
    handleFile, parse, toggleSelect, selectAll, deselectAll, save, reset,
  } = usePdfImport(user, () => {
    onSuccess()
    setTimeout(onClose, 1000)
  })

  const handleClose = () => { reset(); onClose() }

  // Success
  if (step === 'done') {
    const count = saveProgress?.total ?? selected.size
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-base">
            {count === 1 ? '1 scheda importata!' : `${count} schede importate!`}
          </p>
          <p className="text-sm text-gray-500 mt-1">Le puoi trovare nella lista delle tue schede.</p>
        </div>
      </div>
    )
  }

  // Preview / saving
  if ((step === 'preview' || step === 'saving') && workouts.length > 0) {
    const isSaving = step === 'saving'
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {workouts.length} {workouts.length === 1 ? 'settimana trovata' : 'settimane trovate'} · {selected.size} selezionate
          </p>
          <div className="flex gap-3">
            <button onClick={selectAll} className="text-xs text-neon hover:underline">Seleziona tutte</button>
            <button onClick={deselectAll} className="text-xs text-gray-500 hover:text-white">Deseleziona</button>
          </div>
        </div>

        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {workouts.map((w, i) => {
            const isChecked = selected.has(i)
            const daysSummary = w.days
              .map(d => `${d.name} (${d.exercises.length} es.)`)
              .join(' · ')
            return (
              <label
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-neon/5 border-neon/30'
                    : 'bg-dark-700 border-dark-600 opacity-60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSelect(i)}
                  disabled={isSaving}
                  className="mt-0.5 accent-[#39ff14] w-4 h-4 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white leading-tight">{w.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{daysSummary}</p>
                </div>
              </label>
            )
          })}
        </div>

        {isSaving && saveProgress && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-neon rounded-full transition-all duration-300"
                style={{ width: `${(saveProgress.done / saveProgress.total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {saveProgress.done}/{saveProgress.total}
            </span>
          </div>
        )}

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" size="md" onClick={handleClose} className="flex-1" disabled={isSaving}>
            Annulla
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={save}
            className="flex-1"
            disabled={isSaving || selected.size === 0}
          >
            {isSaving ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                Importazione…
              </span>
            ) : `Importa ${selected.size === workouts.length ? 'tutte' : selected.size === 1 ? '1 scheda' : `${selected.size} schede`}`}
          </Button>
        </div>
      </div>
    )
  }

  // Upload (idle / parsing)
  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const f = e.dataTransfer.files[0]
          if (f?.type === 'application/pdf') handleFile(f)
        }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-dark-600 hover:border-neon/40 rounded-2xl p-8 text-center cursor-pointer transition-colors group"
      >
        <div className="w-12 h-12 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center mx-auto mb-3 group-hover:border-neon/30 transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="12" x2="12" y2="18"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
        </div>

        {file ? (
          <div>
            <p className="text-white text-sm font-medium">{file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB · PDF</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-white font-medium mb-1">Trascina il PDF qui</p>
            <p className="text-xs text-gray-500">oppure clicca per scegliere il file</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
      </div>

      <p className="text-xs text-gray-600 text-center -mt-1">
        Funziona solo con PDF con testo selezionabile, non con scansioni.
      </p>

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      <Button
        variant="primary"
        size="md"
        onClick={parse}
        disabled={!file || step === 'parsing'}
        className="w-full"
      >
        {step === 'parsing' ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
            Lettura PDF in corso…
          </span>
        ) : 'Leggi PDF'}
      </Button>
    </div>
  )
}
