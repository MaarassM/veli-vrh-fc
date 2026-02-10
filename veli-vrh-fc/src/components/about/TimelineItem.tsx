import { motion } from 'motion/react'
import type { TimelineEvent } from '@/types'
import Badge from '@/components/ui/Badge'

interface TimelineItemProps {
  event: TimelineEvent
  index: number
}

const categoryLabels = {
  founding: 'Osnivanje',
  achievement: 'Uspjeh',
  milestone: 'Prekretnica',
  infrastructure: 'Infrastruktura',
}

const categoryColors = {
  founding: 'bg-orange-500',
  achievement: 'bg-green-500',
  milestone: 'bg-blue-500',
  infrastructure: 'bg-purple-500',
}

export default function TimelineItem({ event, index }: TimelineItemProps) {
  const isEven = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative"
    >
      <div className="flex items-center gap-4 md:gap-8">
        {/* Year badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex-shrink-0 w-20 md:w-24"
        >
          <div className="bg-orange-500 text-white font-display font-bold text-lg md:text-xl px-4 py-2 rounded-lg text-center shadow-lg">
            {event.year}
          </div>
        </motion.div>

        {/* Content card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="font-display font-semibold text-lg md:text-xl text-gray-900">
              {event.title}
            </h3>
            <Badge variant={event.category === 'achievement' ? 'success' : 'default'}>
              {categoryLabels[event.category]}
            </Badge>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {event.description}
          </p>
          {/* Decorative dot */}
          <div
            className={`absolute left-[4.5rem] md:left-[5.5rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${categoryColors[event.category]} ring-4 ring-white`}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
