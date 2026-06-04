import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { parseWorkoutPdf, isValidParsedWorkout } from '../lib/pdfParser'
import type { ParsedWorkout } from '../lib/pdfParser'
import type { User } from '@supabase/supabase-js'

type Step = 'idle' | 'parsing' | 'preview' | 'saving' | 'done'

async function saveWorkout(userId: string, workout: ParsedWorkout): Promise<void> {
  const { data: plan, error: planErr } = await supabase
    .from('workout_plans')
    .insert({ user_id: userId, name: workout.name, description: null })
    .select('id')
    .single()
  if (planErr) throw planErr

  for (let di = 0; di < workout.days.length; di++) {
    const day = workout.days[di]
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
}

export function usePdfImport(user: User | null, onSuccess: () => void) {
  const [step, setStep] = useState<Step>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [workouts, setWorkouts] = useState<ParsedWorkout[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [saveProgress, setSaveProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setStep('idle')
    setFile(null)
    setWorkouts([])
    setSelected(new Set())
    setSaveProgress(null)
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

    const results = await parseWorkoutPdf(file)

    if (!results || results.filter(isValidParsedWorkout).length === 0) {
      setError(
        'Non è stato possibile leggere la scheda. Il PDF potrebbe essere una scansione o avere un formato non supportato. Prova a creare la scheda manualmente.'
      )
      setStep('idle')
      return
    }

    const valid = results.filter(isValidParsedWorkout)
    setWorkouts(valid)
    setSelected(new Set(valid.map((_, i) => i)))
    setStep('preview')
  }

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(workouts.map((_, i) => i)))
  const deselectAll = () => setSelected(new Set())

  const save = async () => {
    if (!user || selected.size === 0) return
    setStep('saving')
    setError(null)

    const toSave = workouts.filter((_, i) => selected.has(i))
    setSaveProgress({ done: 0, total: toSave.length })

    try {
      for (let i = 0; i < toSave.length; i++) {
        await saveWorkout(user.id, toSave[i])
        setSaveProgress({ done: i + 1, total: toSave.length })
      }
      setStep('done')
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore durante il salvataggio.')
      setStep('preview')
      setSaveProgress(null)
    }
  }

  return {
    step, file, workouts, selected, saveProgress, error,
    handleFile, parse, toggleSelect, selectAll, deselectAll, save, reset,
  }
}
