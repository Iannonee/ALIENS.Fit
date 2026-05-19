import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { WorkoutPlan } from '../types'

export function usePlans(user: User | null) {
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    if (!user) {
      setPlans([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('workout_plans')
        .select(`
          *,
          workout_days(id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setPlans(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle schede')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const createPlan = async (name: string, description: string | null) => {
    if (!user) throw new Error('Non autenticato')

    const { error } = await supabase
      .from('workout_plans')
      .insert({ user_id: user.id, name, description })

    if (error) throw error
    await fetchPlans()
  }

  const updatePlan = async (id: string, name: string, description: string | null) => {
    const { error } = await supabase
      .from('workout_plans')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    await fetchPlans()
  }

  const deletePlan = async (id: string) => {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchPlans()
  }

  return { plans, loading, error, createPlan, updatePlan, deletePlan, refetch: fetchPlans }
}
