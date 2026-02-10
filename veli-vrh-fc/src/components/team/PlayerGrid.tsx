import { useState } from 'react'
import { motion } from 'motion/react'
import type { PlayerPosition } from '@/types'
import PlayerCard from './PlayerCard'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import { players } from '@/data/players'

const positionFilters: { label: string; value: PlayerPosition | 'all' }[] = [
  { label: 'Svi', value: 'all' },
  { label: 'Vratari', value: 'Goalkeeper' },
  { label: 'Braniči', value: 'Defender' },
  { label: 'Vezni', value: 'Midfielder' },
  { label: 'Napadači', value: 'Forward' },
]

export default function PlayerGrid() {
  const [activeFilter, setActiveFilter] = useState<PlayerPosition | 'all'>('all')

  const filteredPlayers =
    activeFilter === 'all'
      ? players
      : players.filter((p) => p.position === activeFilter)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Naša momčad"
          subtitle="Upoznajte igrače NK Veli Vrh koji nose klupske boje s ponosom"
        />

        {/* Position filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {positionFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? 'primary' : 'secondary'}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </motion.div>

        {/* Players grid */}
        <motion.div
          layout
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredPlayers.map((player, index) => (
            <PlayerCard key={player.id} player={player} index={index} />
          ))}
        </motion.div>

        {/* Empty state */}
        {filteredPlayers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center text-gray-500"
          >
            Nema igrača u ovoj kategoriji.
          </motion.div>
        )}
      </div>
    </section>
  )
}
