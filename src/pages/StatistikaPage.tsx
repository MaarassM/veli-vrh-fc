import { useMemo } from 'react'
import { useScorers } from '@/hooks/useScorers'
import PageHeader from '@/components/ui/PageHeader'
import { useMatchList } from '@/hooks/useMatchList'
import { homeAwayRecord, biggestWin, formString } from '@/lib/stats'
import SEO from '@/components/seo/SEO'

function FormBadge({ result }: { result: string }) {
  const styles: Record<string, string> = {
    W: 'bg-green-500',
    D: 'bg-gray-400',
    L: 'bg-red-500',
  }
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${styles[result] ?? 'bg-gray-300'}`}
    >
      {result === 'W' ? 'P' : result === 'D' ? 'N' : 'I'}
    </span>
  )
}

function VenueCard({ title, record }: { title: string; record: { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number } }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3
        className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div>
          <div className="text-2xl font-black text-green-500 tabular-nums">{record.wins}</div>
          <div className="text-xs text-gray-400">Pobjede</div>
        </div>
        <div>
          <div className="text-2xl font-black text-gray-500 tabular-nums">{record.draws}</div>
          <div className="text-xs text-gray-400">Neriješeno</div>
        </div>
        <div>
          <div className="text-2xl font-black text-red-500 tabular-nums">{record.losses}</div>
          <div className="text-xs text-gray-400">Porazi</div>
        </div>
      </div>
      <div className="text-center text-sm text-gray-500">
        Golovi: <span className="font-bold text-gray-800 tabular-nums">{record.goalsFor}:{record.goalsAgainst}</span>
      </div>
    </div>
  )
}

export default function StatistikaPage() {
  const { scorers, loading: scorersLoading } = useScorers(20)
  const { matches, loading: matchesLoading } = useMatchList('seniori', 'liga', false)

  const record = useMemo(() => homeAwayRecord(matches), [matches])
  const bestWin = useMemo(() => biggestWin(matches), [matches])
  const form = useMemo(() => formString(matches, 5), [matches])

  const loading = scorersLoading || matchesLoading

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO
        title="Statistika | NK Veli Vrh"
        description="Statistika NK Veli Vrh — ligaški strijelci, forma, učinak kod kuće i u gostima. Podaci s HNS Semafora."
        canonicalPath="/statistika"
      />
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Statistika" subtitle="Seniori — Elitna liga NSŽI" />

        {loading ? (
          <div className="space-y-6">
            <div className="animate-pulse bg-white rounded-2xl h-64 border border-gray-100" />
            <div className="animate-pulse bg-white rounded-2xl h-40 border border-gray-100" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Forma + najveća pobjeda */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-900 text-white rounded-2xl p-6 text-center">
                <h3
                  className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Forma (zadnjih 5)
                </h3>
                <div className="flex items-center justify-center gap-2">
                  {form.split('').map((r, i) => (
                    <FormBadge key={i} result={r} />
                  ))}
                  {form.length === 0 && <span className="text-gray-400 text-sm">Nema odigranih utakmica</span>}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <h3
                  className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Najveća pobjeda
                </h3>
                {bestWin ? (
                  <div className="text-gray-800">
                    <span className={bestWin.venue === 'home' ? 'font-bold' : ''}>{bestWin.homeTeam}</span>
                    <span className="mx-2 font-black tabular-nums">
                      {bestWin.homeScore}:{bestWin.awayScore}
                    </span>
                    <span className={bestWin.venue === 'away' ? 'font-bold' : ''}>{bestWin.awayTeam}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </div>
            </section>

            {/* Dom / gosti */}
            <section>
              <h2 className="heading-club text-2xl text-gray-900 mb-4">
                Učinak — dom i gosti
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VenueCard title="Kod kuće (Tivoli)" record={record.home} />
                <VenueCard title="U gostima" record={record.away} />
              </div>
            </section>

            {/* Ligaški strijelci */}
            <section>
              <h2 className="heading-club text-2xl text-gray-900 mb-4">
                Ligaški strijelci
              </h2>
              {scorers.length === 0 ? (
                <p className="text-gray-400 text-sm">Podaci o strijelcima trenutno nisu dostupni.</p>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <ul className="divide-y divide-gray-50">
                    {scorers.map(s => {
                      const isVeliVrh = /veli vrh/i.test(s.club)
                      return (
                        <li
                          key={`${s.position}-${s.name}`}
                          className={`flex items-center gap-3 px-4 py-2.5 ${isVeliVrh ? 'bg-orange-50' : ''}`}
                        >
                          <span className="w-6 text-right text-sm font-bold text-gray-400 tabular-nums shrink-0">
                            {s.position}.
                          </span>
                          {s.photoUrl ? (
                            <img src={s.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover object-top bg-gray-100 shrink-0" loading="lazy" />
                          ) : (
                            <span className="h-9 w-9 rounded-full bg-gray-100 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm truncate ${isVeliVrh ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                              {s.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">{s.club}</div>
                          </div>
                          <span
                            className="text-lg font-black text-gray-900 tabular-nums shrink-0"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {s.goals}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </section>

            <p className="text-center text-xs text-gray-400">Podaci: HNS Semafor</p>
          </div>
        )}
      </div>
    </div>
  )
}
