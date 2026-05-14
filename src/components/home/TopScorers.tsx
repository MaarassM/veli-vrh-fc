import { motion } from 'motion/react'
import { useTopScorers } from '@/hooks/useHNSData'
import { Trophy } from 'lucide-react'

export default function TopScorers() {
  const { data: topScorers, loading, error } = useTopScorers(5)

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Najbolji strijelci
            </h2>
            <p className="text-lg text-gray-600">
              Top 5 strijelaca sezone 25/26
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-80"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || !topScorers || topScorers.length === 0) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>Greška pri učitavanju strijelaca: {error || 'Nema podataka'}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Najbolji strijelci
          </h2>
          <p className="text-lg text-gray-600">
            Top 5 strijelaca sezone 25/26
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {topScorers.map((player, index) => (
            <motion.div
              key={`${player.firstName}-${player.lastName}-${player.number}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`relative bg-gradient-to-br ${
                index === 0
                  ? 'from-yellow-400 to-yellow-600 ring-4 ring-yellow-400/30'
                  : index === 1
                  ? 'from-gray-300 to-gray-500'
                  : index === 2
                  ? 'from-orange-400 to-orange-600'
                  : 'from-gray-100 to-gray-200'
              } rounded-xl overflow-hidden shadow-lg transition-all`}
            >
              {/* Rank badge */}
              <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm shadow-lg ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-500 text-white' :
                'bg-white text-gray-900'
              }`}>
                {index + 1}
              </div>

              {/* Player image */}
              <div className="relative aspect-square bg-white/10">
                {player.imageUrl ? (
                  <img
                    src={player.imageUrl}
                    alt={`${player.firstName} ${player.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    <span className="font-display text-4xl">{player.firstName[0]}{player.lastName[0]}</span>
                  </div>
                )}
                {index === 0 && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white p-2 rounded-full shadow-lg">
                    <Trophy className="w-5 h-5" fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Player info */}
              <div className={`p-4 ${
                index < 3 ? 'text-white' : 'text-gray-900'
              }`}>
                <div className="font-display font-bold text-lg mb-1 truncate">
                  {player.firstName} {player.lastName}
                </div>
                <div className={`text-sm mb-2 ${
                  index < 3 ? 'text-white/90' : 'text-gray-600'
                }`}>
                  #{player.number} • {player.position}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <span className="text-sm font-medium">Golovi</span>
                  <span className="font-display text-2xl font-bold">{player.goals}</span>
                </div>
                {player.assists && player.assists > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs">Asistencije</span>
                    <span className="text-sm font-semibold">{player.assists}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <a
            href="/team"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold transition-colors"
          >
            Pogledaj cijelu momčad
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
