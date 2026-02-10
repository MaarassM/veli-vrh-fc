import { useState } from 'react'
import { motion } from 'motion/react'
import type { TrophyCategory } from '@/types'
import TrophyCard from './TrophyCard'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import { trophies } from '@/data/trophies'

const categoryFilters: { label: string; value: TrophyCategory | 'all' }[] = [
  { label: 'Svi', value: 'all' },
  { label: 'Liga', value: 'League' },
  { label: 'Kup', value: 'Cup' },
  { label: 'Regionalno', value: 'Regional' },
  { label: 'Omladina', value: 'Youth' },
]

export default function TrophyGrid() {
  const [activeFilter, setActiveFilter] = useState<TrophyCategory | 'all'>('all')

  const filteredTrophies =
    activeFilter === 'all'
      ? trophies
      : trophies.filter((t) => t.category === activeFilter)

  // Sort by year descending
  const sortedTrophies = [...filteredTrophies].sort((a, b) => b.year - a.year)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Naši trofejii"
          subtitle="Popis osvojenih natjecanja i priznanja kroz povijest kluba"
        />

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {categoryFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? 'primary' : 'secondary'}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </motion.div>

        {/* Trophies grid */}
        <motion.div
          layout
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {sortedTrophies.map((trophy, index) => (
            <TrophyCard key={trophy.id} trophy={trophy} index={index} />
          ))}
        </motion.div>

        {/* Trophy count */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            Prikazano <strong className="text-orange-500">{sortedTrophies.length}</strong>{' '}
            {activeFilter === 'all' ? 'od ukupno' : ''} {activeFilter === 'all' && sortedTrophies.length}{' '}
            trofeji{sortedTrophies.length === 1 ? '' : 'a'}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
