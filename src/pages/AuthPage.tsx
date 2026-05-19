import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

type Tab = 'login' | 'register'

export function AuthPage() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()

  const handleTabChange = (t: Tab) => {
    setTab(t)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password, username.trim())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si è verificato un errore')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-dark-700 border border-dark-600 rounded-xl text-white px-4 py-3 focus:border-neon focus:outline-none transition-colors placeholder-gray-600 text-sm'

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <img src="/logo.svg" alt="AliensFit" className="h-24 w-auto mx-auto" />
      </div>

      <div className="w-full max-w-sm bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-2xl">
        <div className="flex bg-dark-700 rounded-xl p-1 mb-6">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'login' ? 'bg-neon text-dark-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            Accedi
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'register' ? 'bg-neon text-dark-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            Registrati
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Username <span className="text-neon">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="es. alien_warrior"
                required
                className={inputClass}
                autoComplete="username"
              />
            </div>
          )}

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

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full mt-1">
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
        Powered by AliensFit © 2025
      </p>
    </div>
  )
}
