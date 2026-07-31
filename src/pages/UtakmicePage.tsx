import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useMatchList, type CompetitionFilter } from '@/hooks/useMatchList'
import { groupByPart, nextMatch } from '@/lib/matches'
import RoundSection from '@/components/utakmice/RoundSection'
import SEO from '@/components/seo/SEO'

const TABS = [
  { key: 'seniori', label: 'Seniori' },
  { key: 'juniori', label: 'Juniori' },
  { key: 'pioniri', label: 'Pioniri' },
  { key: 'mladi-pioniri', label: 'Mlađi pioniri' },
  { key: 'u-11', label: 'U-11' },
  { key: 'u-9', label: 'U-9' },
  { key: 'veterani', label: 'Veterani' },
]

const COMPETITIONS: Array<{ key: CompetitionFilter; label: string }> = [
  { key: 'liga', label: 'Liga' },
  { key: 'kup', label: 'Kup' },
  { key: 'sve', label: 'Sve' },
]

export default function UtakmicePage() {
  const [category, setCategory] = useState('seniori')
  const [competition, setCompetition] = useState<CompetitionFilter>('liga')
  const [wholeLeague, setWholeLeague] = useState(false)
  const { matches, loading, error } = useMatchList(category, competition, wholeLeague)

  const parts = useMemo(() => groupByPart(matches), [matches])
  const upcoming = useMemo(() => nextMatch(matches), [matches])
  const currentRoundRef = useRef<HTMLDivElement>(null)
  const scrolledOnce = useRef(false)

  // Auto-scroll na aktualno kolo nakon prvog učitavanja
  useEffect(() => {
    if (!loading && !scrolledOnce.current && currentRoundRef.current) {
      scrolledOnce.current = true
      currentRoundRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loading, parts])

  const currentKey = upcoming ? `${upcoming.part ?? ''}|${upcoming.round ?? ''}` : null

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO
        title="Utakmice | NK Veli Vrh"
        description="Raspored i rezultati utakmica NK Veli Vrh — liga, kup i sve kategorije. Podaci s HNS Semafora."
        canonicalPath="/utakmice"
      />
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Utakmice
          </h1>
          <p className="text-gray-500 text-lg">Raspored i rezultati — NK Veli Vrh</p>
          <a
            href={`/kalendar.ics?category=${category}`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            📅 Dodaj raspored u svoj kalendar
          </a>
        </motion.div>

        {/* Kategorije */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setCategory(tab.key); scrolledOnce.current = false }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                category === tab.key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Natjecanje + opseg */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="inline-flex rounded-full bg-white border border-gray-200 p-1">
            {COMPETITIONS.map(c => (
              <button
                key={c.key}
                onClick={() => { setCompetition(c.key); scrolledOnce.current = false }}
                className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                  competition === c.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={wholeLeague}
              onChange={e => { setWholeLeague(e.target.checked); scrolledOnce.current = false }}
              className="accent-orange-500 h-4 w-4"
            />
            Cijela liga
          </label>
        </div>

        {/* Sadržaj */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl h-16 border border-gray-100" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-12">{error}</p>
        ) : parts.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Nema utakmica za odabrani filter.</p>
        ) : (
          <div className="space-y-10">
            {parts.map(partGroup => (
              <div key={partGroup.part || 'liga'}>
                {parts.length > 1 && partGroup.part && (
                  <h2
                    className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {partGroup.part}
                  </h2>
                )}
                <div className="space-y-8">
                  {partGroup.groups.map(group => {
                    const key = `${partGroup.part}|${group.round ?? ''}`
                    const isCurrent = currentKey !== null && key === currentKey
                    return (
                      <div
                        key={key}
                        ref={isCurrent ? currentRoundRef : undefined}
                        className="scroll-mt-24"
                      >
                        <RoundSection group={group} highlight={isCurrent} />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          Podaci: HNS Semafor · automatsko osvježavanje
        </p>
      </div>
    </div>
  )
}
