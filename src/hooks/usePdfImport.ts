import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { parseWorkoutPdf, isValidParsedWorkout } from '../lib/pdfParser'
import type { ParsedWorkout } from '../lib/pdfParser'
import type { User } from '@supabase/supabase-js'

type Step = 'idle' | 'parsing' | 'preview' | 'saving' | 'done'

export function usePdfImport(user: User | null, onSuccess: () => void) {
  const [step, setStep] = useState<Step>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedWorkout | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setStep('idle')
    setFile(null)
    setParsed(null)
    setError(null)
  }

  const handleFile = (f: File) => {
    setError(null)
    if (f.size > 10 * 1024 * 1024) {
      setError('Il PDF è troppo grande. Massimo 10MB.')
      return
    }
    setFile(f)
  }

  const parse = async () => {
    if (!file) return
    setError(null)
    setStep('parsing')

    const result = await parseWorkoutPdf(file)

    if (!result || !isValidParsedWorkout(result)) {
      setError(
        'Non è stato possibile leggere la scheda. Il PDF potrebbe essere una scansione o avere un formato non supportato. Prova a creare la scheda manualmente.'
      )
      setStep('idle')
      return
    }

    setParsed(result)
    setStep('preview')
  }

  const save = async () => {
    if (!parsed || !user) return
    setStep('saving')
    setError(null)

    try {
      // Create plan
      const { data: plan, error: planErr } = await supabase
        .from('workout_plans')
        .insert({ user_id: user.id, name: parsed.name, description: null })
        .select('id')
        .single()
      if (planErr) throw planErr

      // Create days + exercises
      for (let di = 0; di < parsed.days.length; di++) {
        const day = parsed.days[di]
        const { data: dayRow, error: dayErr } = await supabase
          .from('workout_days')
          .insert({ plan_id: plan.id, name: day.name, order_index: di })
          .select('id')
          .single()
        if (dayErr) throw dayErr

        if (day.exercises.length > 0) {
          const { error: exErr } = await supabase.from('exercises').insert(
            day.exercises.map((ex, ei) => ({
              day_id: dayRow.id,
              name: ex.name,
              exercise_type: ex.exercise_type,
              sets: ex.sets,
              reps: ex.reps,
              rest_seconds: ex.rest_seconds,
              weight_kg: null,
              notes: ex.notes || null,
              order_index: ei,
            }))
          )
          if (exErr) throw exErr
        }
      }

      setStep('done')
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore durante il salvataggio.')
      setStep('preview')
    }
  }

  return { step, file, parsed, error, handleFile, parse, save, reset }
}
