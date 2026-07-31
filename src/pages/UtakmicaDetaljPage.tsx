import { Link, useParams } from 'react-router'
import { motion } from 'motion/react'
import { ArrowLeft, MapPin, Users, UserCheck, ImageDown } from 'lucide-react'
import { useMatch } from '@/hooks/useMatch'
import MatchEvents from '@/components/utakmice/MatchEvents'
import MatchLineups from '@/components/utakmice/MatchLineups'
import SEO from '@/components/seo/SEO'

function formatKickoff(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function UtakmicaDetaljPage() {
  const { id } = useParams()
  const { match, loading, notFound, error } = useMatch(id)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO
        title={match ? `${match.info.homeTeam} ${match.info.homeScore}:${match.info.awayScore} ${match.info.awayTeam} | NK Veli Vrh` : 'Izvještaj s utakmice | NK Veli Vrh'}
        description="Izvještaj s utakmice — golovi, kartoni, sastavi i gledatelji. Podaci s HNS Semafora."
        canonicalPath={`/utakmice/${id ?? ''}`}
      />
      <div className="mx-auto max-w-3xl">
        <Link
          to="/utakmice"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Sve utakmice
        </Link>

        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse bg-white rounded-2xl h-40 border border-gray-100" />
            <div className="animate-pulse bg-white rounded-2xl h-64 border border-gray-100" />
          </div>
        ) : notFound ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">Detalji ove utakmice još nisu dostupni.</p>
            <p className="text-sm text-gray-400">
              Podaci s HNS Semafora povlače se postupno — pokušaj kasnije.
            </p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-16">{error}</p>
        ) : match ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Rezultat */}
            <div className="bg-gray-900 text-white rounded-2xl px-6 py-8 text-center">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div
                  className="text-lg sm:text-2xl font-bold text-right"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {match.info.homeTeam}
                </div>
                <div className="text-3xl sm:text-5xl font-black tabular-nums px-2">
                  {match.info.homeScore}:{match.info.awayScore}
                </div>
                <div
                  className="text-lg sm:text-2xl font-bold text-left"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {match.info.awayTeam}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-gray-300">
                {formatKickoff(match.info.kickoffAt) && (
                  <span>{formatKickoff(match.info.kickoffAt)}</span>
                )}
                {match.info.venue && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {match.info.venue}
                  </span>
                )}
                {match.info.attendance !== null && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> {match.info.attendance} gledatelja
                  </span>
                )}
              </div>
              {match.info.referees && (
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-400">
                  <UserCheck className="h-3 w-3" /> {match.info.referees}
                </div>
              )}
            </div>

            {/* Događaji */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2
                className="text-xl font-bold text-gray-800 mb-4 text-center"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Tijek utakmice
              </h2>
              <MatchEvents events={match.events} />
            </section>

            {/* Sastavi */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2
                className="text-xl font-bold text-gray-800 mb-4 text-center"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Sastavi
              </h2>
              <MatchLineups lineups={match.lineups} />
            </section>

            <div className="text-center">
              <a
                href={`/api/og/match?id=${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                <ImageDown className="h-4 w-4" /> Preuzmi grafiku rezultata
              </a>
            </div>

            <p className="text-center text-xs text-gray-400">Podaci: HNS Semafor</p>
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}
