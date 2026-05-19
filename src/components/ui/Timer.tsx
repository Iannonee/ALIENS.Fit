import { useState, useEffect, useRef } from 'react'

interface TimerProps {
  seconds: number
  onComplete?: () => void
}

export function Timer({ seconds: initialSeconds, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            onComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, onComplete])

  const minutes = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const display = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const progress = timeLeft / initialSeconds

  const circumference = 2 * Math.PI * 36

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative w-24 h-24 ${isRunning ? 'drop-shadow-[0_0_8px_#39ff14]' : ''}`}>
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#242424"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#39ff14"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-neon font-mono">{display}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setIsRunning(r => !r)}
          className="px-4 py-2 bg-neon text-dark-900 font-semibold rounded-lg text-sm hover:brightness-110 transition-all"
        >
          {isRunning ? 'Pausa' : 'Avvia'}
        </button>
        <button
          onClick={() => {
            setIsRunning(false)
            setTimeLeft(initialSeconds)
          }}
          className="px-4 py-2 border border-dark-600 text-[#e0e0e0] rounded-lg text-sm hover:bg-dark-700 transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
