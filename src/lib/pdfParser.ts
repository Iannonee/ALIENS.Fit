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

const SETS_REPS = /^(\d+)\s*[xX×]\s*(\d+[""']?)$/
const DURATION = /^(\d+)\s*min$/i
const REST = /^(\d+)[""']?$/

const SKIP_PATTERNS = [
  'esercizio', 'muscolo', 'metodo di allenamento', 'tempo di recupero',
  'scheda di allenamento', 'scheda valida', 'personal trainer',
  'prima di ogni allenamento', 'aumenta il carico', 'greentheory', 'green theory',
]

const CARDIO_NAMES = ['tapis roulant', 'ellittica', 'bike', 'cyclette', 'vogatore', 'cardio']

const DAY_PREFIXES = [
  /^giorno\s+[a-z0-9]/i,
  /^(push|pull|legs|upper|lower|full\s*body)\b/i,
  /^(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\b/i,
]

function shouldSkip(line: string): boolean {
  if (!line || line === '--') return true
  const lower = line.toLowerCase()
  return SKIP_PATTERNS.some(p => lower.includes(p))
}

function isDayHeader(line: string): boolean {
  return DAY_PREFIXES.some(p => p.test(line.trim()))
}

function isCardio(name: string): boolean {
  const lower = name.toLowerCase()
  return CARDIO_NAMES.some(k => lower.includes(k))
}

function getExerciseType(name: string): 'exercise' | 'warmup' | 'cooldown' {
  const lower = name.toLowerCase()
  if (lower.includes('defaticamento') || lower.includes('cool down') || lower.includes('cooldown')) return 'cooldown'
  if (lower.includes('riscaldamento') || lower.includes('stretching') || lower.includes('mobilità') || lower.includes('warm up') || lower.includes('warmup')) return 'warmup'
  if (isCardio(lower)) return 'warmup' // will be adjusted to cooldown if last
  return 'exercise'
}

function parseRest(token: string): number | null {
  if (!token || token === '--') return null
  const m = REST.exec(token.trim())
  return m ? parseInt(m[1]) : null
}

function extractWorkoutName(firstLines: string[], fileName: string): string {
  for (const line of firstLines) {
    const m = /per\s+([A-Z][a-zA-Zàèéìòù]+(?:\s+[A-Z][a-zA-Zàèéìòù]+)*)/i.exec(line)
    if (m) return `Scheda ${m[1]}`
    if (/scheda|piano|programma|workout/i.test(line) && line.length < 80) {
      return line.trim()
    }
  }
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').trim() || 'Scheda Importata'
}

function fixCooldowns(exercises: ParsedExercise[]): void {
  if (exercises.length === 0) return
  const last = exercises[exercises.length - 1]
  if (last.exercise_type === 'warmup' && isCardio(last.name)) {
    last.exercise_type = 'cooldown'
  }
}

export function isValidParsedWorkout(workout: ParsedWorkout): boolean {
  return workout.days.length > 0 && workout.days.some(d => d.exercises.length > 0)
}

export async function parseWorkoutPdf(file: File): Promise<ParsedWorkout | null> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    // Only parse first page — subsequent pages are the same workout for later weeks
    const page = await pdf.getPage(1)
    const content = await page.getTextContent()

    // Group tokens by Y coordinate (same Y = same row)
    const itemsByY = new Map<number, string[]>()
    for (const item of content.items as Array<{ str: string; transform: number[] }>) {
      const y = Math.round(item.transform[5])
      if (!itemsByY.has(y)) itemsByY.set(y, [])
      itemsByY.get(y)!.push(item.str)
    }

    // Sort Y descending = top to bottom
    const sortedYs = Array.from(itemsByY.keys()).sort((a, b) => b - a)

    const days: ParsedDay[] = []
    let currentDay: ParsedDay | null = null
    let workoutName = ''
    let firstContentLine = true

    for (const y of sortedYs) {
      const tokens = itemsByY.get(y)!
      const nonEmpty = tokens.filter(t => t.trim())
      if (nonEmpty.length === 0) continue

      const joined = nonEmpty.join(' ').replace(/\s{2,}/g, ' ').trim()

      if (shouldSkip(joined)) continue

      // First non-skipped line = potential workout title
      if (firstContentLine) {
        firstContentLine = false
        workoutName = joined
        continue
      }

      if (isDayHeader(joined)) {
        if (currentDay) {
          fixCooldowns(currentDay.exercises)
          days.push(currentDay)
        }
        currentDay = { name: joined.replace(/[-–—]\s*$/, '').trim(), exercises: [] }
        continue
      }

      if (!currentDay) continue

      // Parse exercise row: tokens are [name, muscle, method, rest]
      // nonEmpty[0] = exercise name
      // nonEmpty[1] = muscle group (ignored)
      // nonEmpty[2] = sets×reps or duration
      // nonEmpty[3] = rest seconds or "--"
      const name = nonEmpty[0]?.trim()
      if (!name || name.length < 2) continue

      const methodToken = nonEmpty[2]?.trim() ?? ''
      const restToken = nonEmpty[3]?.trim() ?? ''

      let sets: number | null = null
      let reps: string | null = null
      let duration_minutes: number | null = null

      const srMatch = SETS_REPS.exec(methodToken)
      const durMatch = DURATION.exec(methodToken)

      if (srMatch) {
        sets = parseInt(srMatch[1])
        reps = srMatch[2].replace(/[""']$/, '') // strip trailing quote from "2x45""
      } else if (durMatch) {
        duration_minutes = parseInt(durMatch[1])
      }

      const rest_seconds = parseRest(restToken)
      const exercise_type = getExerciseType(name)

      currentDay.exercises.push({
        exercise_type,
        name,
        sets,
        reps,
        rest_seconds,
        duration_minutes,
        notes: '',
      })
    }

    if (currentDay) {
      fixCooldowns(currentDay.exercises)
      days.push(currentDay)
    }

    if (days.length === 0 || days.every(d => d.exercises.length === 0)) return null

    const workout: ParsedWorkout = {
      name: extractWorkoutName([workoutName], file.name),
      days,
    }

    return workout
  } catch {
    return null
  }
}
