import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { WorkoutSessionWithDetails } from '../types'

export function useHistory(user: User | null) {
  const [sessions, setSessions] = useState<WorkoutSessionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!user) { setLoading(false); return }
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('workout_sessions')
        .select('*, workout_days(name, workout_plans(name))')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
      if (err) throw err
      setSessions((data ?? []) as WorkoutSessionWithDetails[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore caricamento storico')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  // Group sessions by local date string (Italian format)
  const grouped = sessions.reduce<Record<string, WorkoutSessionWithDetails[]>>((acc, s) => {
    const label = new Date(s.completed_at).toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const key = label.charAt(0).toUpperCase() + label.slice(1)
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return { sessions, grouped, loading, error, refetch: fetchHistory }
}
