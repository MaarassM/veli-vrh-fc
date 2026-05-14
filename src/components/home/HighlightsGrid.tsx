import { motion } from 'motion/react'
import { Calendar, Trophy, MapPin, Shield } from 'lucide-react'
import { highlights } from '@/data/highlights'
import type { ReactNode } from 'react'

const icons: Record<string, ReactNode> = {
  'Godina osnutka': <Calendar className="h-8 w-8" />,
  'Trofeji': <Trophy className="h-8 w-8" />,
  'Liga': <Shield className="h-8 w-8" />,
  'Lokacija': <MapPin className="h-8 w-8" />,
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function HighlightsGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {highlights.map((item) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              className="text-center p-8 rounded-xl bg-white border border-gray-100"
            >
              <div className="inline-flex items-center justify-center text-orange-500 mb-4">
                {icons[item.label] ?? <Shield className="h-8 w-8" />}
              </div>
              <div className="font-display text-2xl font-bold text-gray-900 mb-1">
                {item.value}
              </div>
              <div className="text-sm text-gray-500">
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
