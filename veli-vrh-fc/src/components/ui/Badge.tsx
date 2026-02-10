import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'orange' | 'gray' | 'dark' | 'success' | 'default'
}

const variantStyles = {
  orange: 'bg-orange-100 text-orange-700',
  gray: 'bg-gray-100 text-gray-700',
  dark: 'bg-gray-900 text-white',
  success: 'bg-green-100 text-green-700',
  default: 'bg-gray-100 text-gray-700',
}

export default function Badge({ children, variant = 'orange' }: BadgeProps) {
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${variantStyles[variant]}`}>
      {children}
    </span>
  )
}
