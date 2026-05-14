import { useState } from 'react'
import { motion } from 'motion/react'
import { useKategorija } from '@/hooks/useKategorija'
import StandingsTable from '@/components/kategorija/StandingsTable'
import PlayersList from '@/components/kategorija/PlayersList'

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
  const [activeTab, setActiveTab] = useState('seniori')
  const { standings, players, loading, error } = useKategorija(activeTab)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
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
            Sve kategorije
          </h1>
          <p className="text-gray-500 text-lg">
            Ljestvice i igrači po uzrastu — NK Veli Vrh
          </p>
        </motion.div>

        {/* Tab strip */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
