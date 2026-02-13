import { motion } from 'motion/react'
import PlayerCard from './PlayerCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { players } from '@/data/players'

export default function PlayerGrid() {
  // Sort players by jersey number
  const sortedPlayers = [...players].sort((a, b) => a.number - b.number)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Naša momčad"
          subtitle="Upoznajte igrače NK Veli Vrh koji nose klupske boje s ponosom"
        />

        {/* Players grid */}
        <motion.div
          layout
          className="mt-12 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {sortedPlayers.map((player, index) => (
            <PlayerCard key={player.id} player={player} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
