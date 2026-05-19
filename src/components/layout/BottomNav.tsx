import { Link, useLocation } from 'react-router-dom'

const navItems = [
  {
    path: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    path: '/history',
    label: 'Storico',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    path: '/premium',
    label: 'Premium',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-800/95 backdrop-blur border-t border-dark-700 h-16 flex items-center">
      {navItems.map(item => {
        const isActive = item.path === '/dashboard'
          ? location.pathname === '/dashboard'
          : location.pathname.startsWith(item.path)

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors relative ${
              isActive ? 'text-neon' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neon rounded-full shadow-neon" />
            )}
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
