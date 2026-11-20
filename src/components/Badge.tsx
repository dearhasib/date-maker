import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  icon?: ReactNode
  className?: string
}

export function Badge({ children, icon, className = '' }: BadgeProps) {
  return (
    <span
      className={`pill-badge ${className}`}
    >
      {icon ?? (
        <span className="h-1.5 w-1.5 rounded-full bg-coral/80" aria-hidden="true" />
      )}
      {children}
    </span>
  )
}
