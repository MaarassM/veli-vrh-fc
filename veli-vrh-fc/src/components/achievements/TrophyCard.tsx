import { motion } from 'motion/react'
import type { Trophy } from '@/types'
import Badge from '@/components/ui/Badge'
import { Trophy as TrophyIcon, Award, Medal, Star } from 'lucide-react'

interface TrophyCardProps {
  trophy: Trophy
  index: number
}

const categoryIcons = {
  League: TrophyIcon,
  Cup: Award,
  Regional: Medal,
  Youth: Star,
}

const categoryLabels = {
  League: 'Liga',
  Cup: 'Kup',
  Regional: 'Regionalno',
  Youth: 'Omladina',
}

const categoryColors = {
  League: 'from-yellow-400 to-yellow-600',
  Cup: 'from-orange-400 to-orange-600',
  Regional: 'from-blue-400 to-blue-600',
  Youth: 'from-green-400 to-green-600',
}

export default function TrophyCard({ trophy, index }: TrophyCardProps) {
  const Icon = categoryIcons[trophy.category]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
    >
      {/* Gradient header with icon */}
      <div className={`relative h-32 bg-gradient-to-br ${categoryColors[trophy.category]} flex items-center justify-center overflow-hidden`}>
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-16 h-16 text-white drop-shadow-lg" strokeWidth={1.5} />
        </motion.div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant="default">{categoryLabels[trophy.category]}</Badge>
          <div className="text-right">
            <div className="font-display font-bold text-2xl text-orange-500">
              {trophy.year}
            </div>
            <div className="text-xs text-gray-500">
              {trophy.season}
            </div>
          </div>
        </div>

        <h3 className="font-display font-bold text-lg text-gray-900 mb-3 leading-tight">
          {trophy.name}
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed">
          {trophy.description}
        </p>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.div>
  )
}
