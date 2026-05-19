import React from 'react'

type BadgeVariant = 'neon' | 'gray' | 'red' | 'blue' | 'coming-soon'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  neon: 'bg-neon/20 text-neon border border-neon/30',
  gray: 'bg-dark-700 text-[#e0e0e0] border border-dark-600',
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'coming-soon': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
