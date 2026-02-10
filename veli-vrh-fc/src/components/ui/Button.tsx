import { motion } from 'motion/react'
import { Link } from 'react-router'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  className?: string
  icon?: LucideIcon
}

const variantStyles = {
  primary: 'bg-orange-500 text-white hover:bg-orange-600',
  secondary: 'bg-gray-900 text-white hover:bg-gray-800',
  outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
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
  const baseStyles = `inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  if (href) {
    return (
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link to={href} className={baseStyles}>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={baseStyles}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.button>
  )
}
