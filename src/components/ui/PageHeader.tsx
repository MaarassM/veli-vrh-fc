import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface Props {
  title: string
  subtitle?: string
  children?: ReactNode
}

// Jedinstveni header podstranica — klupska tipografija kao u heroju
export default function PageHeader({ title, subtitle, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center mb-10"
    >
      <h1 className="heading-club text-5xl sm:text-6xl text-gray-900 mb-3">
        {title}
      </h1>
      {subtitle && <p className="text-gray-500 text-lg">{subtitle}</p>}
      <div className="mt-4 h-1 w-16 rounded-full bg-orange-500 mx-auto" />
      {children}
    </motion.div>
  )
}
