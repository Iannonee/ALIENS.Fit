import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Exercise } from '../types'

export function useExercises(dayId: string | undefined) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExercises = useCallback(async () => {
    if (!dayId) {
      setExercises([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('day_id', dayId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setExercises(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [dayId])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  const createExercise = async (exercise: Omit<Exercise, 'id' | 'created_at'>) => {
    const { error } = await supabase
      .from('exercises')
      .insert(exercise)

    if (error) throw error
    await fetchExercises()
  }

  const updateExercise = async (id: string, updates: Partial<Omit<Exercise, 'id' | 'created_at'>>) => {
    const { error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    await fetchExercises()
  }

  const deleteExercise = async (id: string) => {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchExercises()
  }

  return { exercises, loading, createExercise, updateExercise, deleteExercise, refetch: fetchExercises }
}
