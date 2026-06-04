import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface ParsedExercise {
  exercise_type: 'exercise' | 'warmup' | 'cooldown'
  name: string
  sets: number | null
  reps: string | null
  rest_seconds: number | null
  duration_minutes: number | null
  notes: string
}

export interface ParsedDay {
  name: string
  exercises: ParsedExercise[]
}

export interface ParsedWorkout {
  name: string
  days: ParsedDay[]
}

const DAY_PATTERNS = [
  /^(giorno\s+[a-zA-Z0-9]+)/i,
  /^(day\s+[a-zA-Z0-9]+)/i,
  /^(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)/i,
  /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  /^(push|pull|legs|upper|lower|full\s*body|chest|back|shoulders|arms)/i,
  /^(allenamento\s+[a-zA-Z0-9]+)/i,
  /^(workout\s+[a-zA-Z0-9]+)/i,
  /\b(giorno|day)\s+[a-zA-Z0-9]+\b.*[-:]/i,
]

const WARMUP_KEYWORDS = ['riscaldamento', 'warm.?up', 'cardio', 'tapis roulant', 'treadmill', 'ellittica', 'bike', 'cyclette', 'corsa', 'camminata']
const COOLDOWN_KEYWORDS = ['defaticamento', 'cool.?down', 'stretching', 'mobilità', 'mobility', 'flessibilità', 'allungamento']

const SETS_REPS_RE = /(\d+)\s*[xX×]\s*(\d+(?:-\d+)?)/
const SETS_SECONDS_RE = /(\d+)\s*[xX×]\s*(\d+)[""'']/
const DURATION_RE = /(\d+)\s*min/i
const REST_RE = /(\d+)[""'']\s*(?:rec(?:upero)?|rest)?|(\d+)\s*sec(?:ondi)?(?:\s+(?:rec(?:upero)?|rest))?/i
const REST_MIN_RE = /(\d+)['']\s*(\d+)[""]/

function extractRest(text: string): number | null {
  const minSecMatch = REST_MIN_RE.exec(text)
  if (minSecMatch) return parseInt(minSecMatch[1]) * 60 + parseInt(minSecMatch[2])

  const secMatch = REST_RE.exec(text)
  if (secMatch) return parseInt(secMatch[1] ?? secMatch[2])

  return null
}

function classifyActivity(text: string, hasMainExercises: boolean): 'warmup' | 'cooldown' | null {
  const lower = text.toLowerCase()
  if (WARMUP_KEYWORDS.some(k => new RegExp(k).test(lower))) {
    return hasMainExercises ? 'cooldown' : 'warmup'
  }
  if (COOLDOWN_KEYWORDS.some(k => new RegExp(k).test(lower))) return 'cooldown'
  return null
}

function isDayHeader(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length < 2 || trimmed.length > 80) return false
  return DAY_PATTERNS.some(p => p.test(trimmed))
}

function isNoiseLine(line: string): boolean {
  const t = line.trim()
  if (!t) return true
  // Pure numbers, page numbers, single chars
  if (/^\d+$/.test(t)) return true
  if (t.length === 1) return true
  // Column headers
  if (/^(esercizio|exercise|serie|sets|reps|ripetizioni|recupero|rest|peso|weight|note)s?$/i.test(t)) return true
  return false
}

function parseExerciseLine(line: string, hasMainExercises: boolean): ParsedExercise | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.length < 3) return null

  const activityType = classifyActivity(trimmed, hasMainExercises)

  // Duration
  const durMatch = DURATION_RE.exec(trimmed)
  const duration_minutes = durMatch ? parseInt(durMatch[1]) : null

  if (activityType) {
    const name = trimmed
      .replace(DURATION_RE, '')
      .replace(/[-:]/g, '')
      .trim()
    return {
      exercise_type: activityType,
      name: name || trimmed,
      sets: null,
      reps: null,
      rest_seconds: null,
      duration_minutes,
      notes: '',
    }
  }

  // Sets x reps (seconds variant first)
  const secMatch = SETS_SECONDS_RE.exec(trimmed)
  const srMatch = SETS_REPS_RE.exec(trimmed)

  const sets = secMatch ? parseInt(secMatch[1]) : srMatch ? parseInt(srMatch[1]) : null
  const reps = secMatch ? `${secMatch[2]}s` : srMatch ? srMatch[2] : null
  const rest_seconds = extractRest(trimmed)

  // Clean exercise name: remove the matched pattern and rest/weight info
  let name = trimmed
    .replace(SETS_SECONDS_RE, '')
    .replace(SETS_REPS_RE, '')
    .replace(REST_MIN_RE, '')
    .replace(REST_RE, '')
    .replace(/\d+(\.\d+)?\s*kg/gi, '')
    .replace(/[-–—|]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (!name || name.length < 2) return null

  return {
    exercise_type: 'exercise',
    name,
    sets,
    reps,
    rest_seconds,
    duration_minutes: null,
    notes: '',
  }
}

function extractWorkoutName(fullText: string, fileName: string): string {
  const lines = fullText.split('\n').slice(0, 10)
  for (const line of lines) {
    const t = line.trim()
    if (/scheda|piano|programma|workout|plan/i.test(t) && t.length < 60) {
      return t.replace(/\s+/g, ' ').trim()
    }
  }
  // Fall back to filename without extension
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').trim() || 'Scheda Importata'
}

export function isValidParsedWorkout(workout: ParsedWorkout): boolean {
  return workout.days.length > 0 && workout.days.some(d => d.exercises.length > 0)
}

export async function parseWorkoutPdf(file: File): Promise<ParsedWorkout | null> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = (content.items as Array<{ str: string }>)
        .map(item => item.str)
        .join(' ')
      fullText += pageText + '\n'
    }

    if (!fullText.trim()) return null

    const workoutName = extractWorkoutName(fullText, file.name)
    const lines = fullText.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean)

    const days: ParsedDay[] = []
    let currentDay: ParsedDay | null = null
    let hasMainExercises = false

    for (const line of lines) {
      if (isNoiseLine(line)) continue

      if (isDayHeader(line)) {
        if (currentDay && currentDay.exercises.length > 0) {
          days.push(currentDay)
        }
        currentDay = { name: line.replace(/[-:]\s*$/, '').trim(), exercises: [] }
        hasMainExercises = false
        continue
      }

      if (!currentDay) {
        // No day header found yet — create a default day
        currentDay = { name: 'Allenamento', exercises: [] }
        hasMainExercises = false
      }

      const exercise = parseExerciseLine(line, hasMainExercises)
      if (exercise) {
        if (exercise.exercise_type === 'exercise') hasMainExercises = true
        currentDay.exercises.push(exercise)
      }
    }

    if (currentDay && currentDay.exercises.length > 0) {
      days.push(currentDay)
    }

    // If everything ended up in one "Allenamento" day but has day-like names as exercise names,
    // just return as-is — the user will see the preview and can correct manually.

    return { name: workoutName, days }
  } catch {
    return null
  }
}
