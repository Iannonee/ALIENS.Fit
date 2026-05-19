export interface WorkoutPlan {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  workout_days?: WorkoutDay[]
}

export interface WorkoutDay {
  id: string
  plan_id: string
  name: string
  order_index: number
  created_at: string
  exercises?: Exercise[]
}

export interface Exercise {
  id: string
  day_id: string
  name: string
  sets: number | null
  reps: string | null
  weight_kg: number | null
  rest_seconds: number | null
  notes: string | null
  order_index: number
  created_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  day_id: string | null
  completed_at: string
  notes: string | null
}
