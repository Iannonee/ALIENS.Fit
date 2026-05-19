import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { SessionExerciseLog } from '../types'

export function useSessionLogs(sessionId: string | null) {
  const [logs, setLogs] = useState<SessionExerciseLog[]>([])
  const [saving, setSaving] = useState(false)

  const addLog = async (entry: Omit<SessionExerciseLog, 'id' | 'session_id' | 'created_at'>) => {
    if (!sessionId) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('session_exercise_logs')
        .insert({ ...entry, session_id: sessionId })
        .select()
        .single()
      if (error) throw error
      setLogs(prev => [...prev, data as SessionExerciseLog])
    } finally {
      setSaving(false)
    }
  }

  return { logs, addLog, saving }
}
