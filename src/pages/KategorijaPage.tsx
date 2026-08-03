import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { motion } from 'motion/react'
import { useKategorija } from '@/hooks/useKategorija'
import { useMatchList } from '@/hooks/useMatchList'
import { nextMatch } from '@/lib/matches'
import MatchCard from '@/components/utakmice/MatchCard'
import StandingsTable from '@/components/kategorija/StandingsTable'
import PageHeader from '@/components/ui/PageHeader'
import PlayersList from '@/components/kategorija/PlayersList'
import SEO from '@/components/seo/SEO'

const TABS = [
  { key: 'seniori',       label: 'Seniori' },
  { key: 'juniori',       label: 'Juniori' },
  { key: 'pioniri',       label: 'Pioniri' },
  { key: 'mladi-pioniri', label: 'Mlađi pioniri' },
  { key: 'u-11',          label: 'U-11' },
  { key: 'u-9',           label: 'U-9' },
  { key: 'veterani',      label: 'Veterani' },
]

export default function KategorijaPage() {
  const { kat } = useParams()
  const navigate = useNavigate()
  const activeTab = TABS.some(t => t.key === kat) ? (kat as string) : 'seniori'
  const activeLabel = TABS.find(t => t.key === activeTab)?.label ?? 'Seniori'
  const { standings, players, loading, error } = useKategorija(activeTab)
  const { matches } = useMatchList(activeTab, 'sve', false)

  const recentAndUpcoming = useMemo(() => {
    const played = matches
      .filter(m => m.status === 'played')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .reverse()
    const upcoming = nextMatch(matches)
    const upcomingList = upcoming
      ? matches
          .filter(m => m.status === 'upcoming')
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 3)
      : []
    return [...played, ...upcomingList]
  }, [matches])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO
        title={kat ? `${activeLabel} | NK Veli Vrh` : 'Kategorije | NK Veli Vrh'}
        description={`Ljestvica, utakmice i igrači — ${activeLabel} NK Veli Vrh. Podaci s HNS Semafora.`}
        canonicalPath={kat ? `/kategorije/${activeTab}` : '/kategorije'}
      />
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <PageHeader
          title={kat ? activeLabel : 'Sve kategorije'}
          subtitle="Ljestvice, utakmice i igrači po uzrastu — NK Veli Vrh"
        />

        {/* Tab strip */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => navigate(`/kategorije/${tab.key}`)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            <div className="animate-pulse bg-white rounded-2xl h-64 border border-gray-200" />
            <div className="animate-pulse bg-white rounded-2xl h-48 border border-gray-200" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-12">{error}</p>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h2
                className="text-xl font-bold text-gray-800 mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ljestvica
              </h2>
              <StandingsTable standings={standings} />
            </div>

            {recentAndUpcoming.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-xl font-bold text-gray-800"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Utakmice
                  </h2>
                  <Link
                    to="/utakmice"
                    className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    Sve utakmice →
                  </Link>
                </div>
                <div className="space-y-2">
                  {recentAndUpcoming.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2
                className="text-xl font-bold text-gray-800 mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Igrači
              </h2>
              <PlayersList players={players} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
