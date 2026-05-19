import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

export function Navbar() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // ignore
    }
  }

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-dark-900/90 backdrop-blur border-b border-dark-700 h-14 px-6 items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-neon flex items-center justify-center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <span className="text-white font-bold tracking-tight">
          ALIENS<span className="text-neon">.Fit</span>
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 truncate max-w-[200px]">
            {user.user_metadata?.username ?? user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Esci
          </Button>
        </div>
      )}
    </nav>
  )
}
