import { Link } from 'react-router'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-white'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  className?: string
  icon?: LucideIcon
}

const variantStyles = {
  primary: 'bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-500 hover:border-orange-600',
  secondary: 'bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 hover:border-gray-800',
  outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
  'outline-white': 'border-2 border-white text-white hover:bg-white hover:text-gray-900',
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
  icon: Icon,
}: ButtonProps) {
  const baseStyles = `inline-flex items-center justify-center gap-2 font-black italic uppercase tracking-widest rounded-none transition-colors duration-200 cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  const style = { fontFamily: "var(--font-barlow-condensed)" }

  if (href) {
    return (
      <Link to={href} className={baseStyles} style={style}>
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={baseStyles} style={style}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  )
}
