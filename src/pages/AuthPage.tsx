import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

type Tab = 'login' | 'register'

export function AuthPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setSuccess('Registrazione effettuata! Controlla la tua email per confermare.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si è verificato un errore')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-dark-700 border border-dark-600 rounded-xl text-white px-4 py-3 focus:border-neon focus:outline-none transition-colors placeholder-gray-600 text-sm'

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-neon flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            ALIENS<span className="text-neon">.Fit</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500">Il tuo personal trainer alieno</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-2xl">
        {/* Tabs */}
        <div className="flex bg-dark-700 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setTab('login'); setError(null); setSuccess(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'login'
                ? 'bg-neon text-dark-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Accedi
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); setSuccess(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'register'
                ? 'bg-neon text-dark-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Registrati
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="alien@example.com"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-neon/10 border border-neon/30 rounded-xl px-4 py-3">
              <p className="text-neon text-sm">{success}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full mt-1"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                {tab === 'login' ? 'Accesso...' : 'Registrazione...'}
              </span>
            ) : tab === 'login' ? 'Accedi' : 'Crea account'}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-xs text-gray-600 text-center">
        Powered by ALIENS.Fit © 2024
      </p>
    </div>
  )
}
