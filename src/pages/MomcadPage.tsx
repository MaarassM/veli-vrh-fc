import { useMemo } from 'react'
import { motion } from 'motion/react'
import { usePlayerStats } from '@/hooks/useHNSData'
import PlayerStatCard from '@/components/momcad/PlayerStatCard'
import StaffSection from '@/components/team/StaffSection'
import SEO from '@/components/seo/SEO'

export default function MomcadPage() {
  const { data: players, loading } = usePlayerStats()

  const { goalkeepers, outfield, topScorers } = useMemo(() => {
    const withImage = players.map(p => ({ ...p, imageUrl: p.imageUrl ?? null }))
    return {
      goalkeepers: withImage.filter(p => /vratar/i.test(p.position)),
      outfield: withImage.filter(p => !/vratar/i.test(p.position)),
      topScorers: [...withImage].filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 3),
    }
  }, [players])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO
        title="Momčad | NK Veli Vrh"
        description="Seniorska momčad NK Veli Vrh — igrači, statistike i stručni stožer. Podaci s HNS Semafora."
        canonicalPath="/momcad"
      />
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Momčad
          </h1>
          <p className="text-gray-500 text-lg">Seniori — NK Veli Vrh</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl aspect-[4/6] border border-gray-100" />
            ))}
          </div>
        ) : players.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Podaci o igračima trenutno nisu dostupni.</p>
        ) : (
          <div className="space-y-12">
            {/* Top strijelci */}
            {topScorers.length > 0 && (
              <section>
                <h2
                  className="text-xl font-bold text-gray-800 mb-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Najbolji strijelci
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topScorers.map((p, i) => (
                    <div
                      key={`${p.firstName}-${p.lastName}`}
                      className="flex items-center gap-4 bg-gray-900 text-white rounded-2xl p-4"
                    >
                      <div
                        className="text-4xl font-black text-orange-400 tabular-nums"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {i + 1}.
                      </div>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="h-14 w-14 rounded-full object-cover object-top bg-gray-700" />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gray-700" />
                      )}
                      <div className="min-w-0">
                        <div className="font-bold truncate" style={{ fontFamily: 'var(--font-display)' }}>
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-sm text-gray-300">
                          {p.goals} {p.goals === 1 ? 'gol' : p.goals < 5 ? 'gola' : 'golova'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Vratari */}
            {goalkeepers.length > 0 && (
              <section>
                <h2
                  className="text-xl font-bold text-gray-800 mb-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Vratari
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {goalkeepers.map(p => (
                    <PlayerStatCard key={`${p.firstName}-${p.lastName}-${p.number}`} player={p} />
                  ))}
                </div>
              </section>
            )}

            {/* Igrači */}
            <section>
              <h2
                className="text-xl font-bold text-gray-800 mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Igrači
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {outfield.map(p => (
                  <PlayerStatCard key={`${p.firstName}-${p.lastName}-${p.number}`} player={p} />
                ))}
              </div>
            </section>

            {/* Stožer */}
            <section>
              <StaffSection />
            </section>

            <p className="text-center text-xs text-gray-400">Podaci: HNS Semafor</p>
          </div>
        )}
      </div>
    </div>
  )
}
