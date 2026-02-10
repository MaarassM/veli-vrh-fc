import { motion } from 'motion/react'
import type { Player } from '@/types'
import Badge from '@/components/ui/Badge'
import { Crown } from 'lucide-react'

interface PlayerCardProps {
  player: Player
  index: number
}

const positionLabels: Record<string, string> = {
  Goalkeeper: 'Vratar',
  Defender: 'Branič',
  Midfielder: 'Vezni',
  Forward: 'Napadač',
}

export default function PlayerCard({ player, index }: PlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={player.image}
          alt={`${player.firstName} ${player.lastName}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Number overlay */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-orange-500 text-white font-display font-bold text-2xl rounded-lg flex items-center justify-center shadow-lg">
          {player.number}
        </div>

        {/* Captain badge */}
        {player.isCaptain && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="absolute top-4 left-4 bg-yellow-500 text-white p-2 rounded-full shadow-lg"
          >
            <Crown className="w-5 h-5" fill="currentColor" />
          </motion.div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Player info */}
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-gray-900 mb-1">
          {player.firstName} {player.lastName}
        </h3>
        <div className="flex items-center justify-between">
          <Badge variant="default">
            {positionLabels[player.position]}
          </Badge>
          <span className="text-sm text-gray-500">
            {player.nationality}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
