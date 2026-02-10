import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
}

export default function Card({ children, className = '', hoverable = true }: CardProps) {
  const baseStyles = `rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden ${className}`

  if (hoverable) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={baseStyles}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={baseStyles}>{children}</div>
}
