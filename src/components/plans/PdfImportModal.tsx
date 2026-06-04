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
  const { step, file, parsed, error, handleFile, parse, save, reset } = usePdfImport(user, () => {
    onSuccess()
    setTimeout(onClose, 800)
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  // Success state
  if (step === 'done') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-base">Scheda importata!</p>
          <p className="text-sm text-gray-500 mt-1">La puoi trovare nella lista delle tue schede.</p>
        </div>
      </div>
    )
  }

  // Preview / confirm step
  if ((step === 'preview' || step === 'saving') && parsed) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Scheda rilevata</p>
          <p className="text-white font-semibold text-sm mb-3">"{parsed.name}"</p>
          <div className="flex flex-col gap-2">
            {parsed.days.map((day, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-sm text-[#e0e0e0]">
                  {day.name}
                  <span className="text-gray-500 ml-1">({day.exercises.length} esercizi)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" size="md" onClick={handleClose} className="flex-1" disabled={step === 'saving'}>
            Annulla
          </Button>
          <Button variant="primary" size="md" onClick={save} className="flex-1" disabled={step === 'saving'}>
            {step === 'saving' ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                Salvataggio…
              </span>
            ) : 'Conferma e salva'}
          </Button>
        </div>
      </div>
    )
  }

  // Upload step (idle / parsing)
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
        ) : 'Importa scheda'}
      </Button>
    </div>
  )
}
