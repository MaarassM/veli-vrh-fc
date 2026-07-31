import { Link } from 'react-router'
import type { MatchItem } from '@/lib/matches'

interface Props {
  match: MatchItem & { homeLogoUrl?: string; awayLogoUrl?: string }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('hr-HR', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

function TeamName({ name }: { name: string }) {
  const isVeliVrh = /veli vrh/i.test(name)
  return (
    <span className={`truncate ${isVeliVrh ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
      {name}
    </span>
  )
}

export default function MatchCard({ match }: Props) {
  const played = match.status === 'played'
  const isCup = /kup/i.test(match.competition)

  const inner = (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Datum i vrijeme */}
      <div className="w-20 shrink-0 text-xs text-gray-400">
        <div>{formatDate(match.date)}</div>
        {match.time && <div>{match.time}</div>}
      </div>

      {/* Klubovi i rezultat */}
      <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 min-w-0">
        <div className="flex items-center justify-end gap-2 min-w-0">
          <TeamName name={match.homeTeam} />
          {match.homeLogoUrl && (
            <img src={match.homeLogoUrl} alt="" className="h-6 w-6 object-contain shrink-0" loading="lazy" />
          )}
        </div>

        <div
          className={`px-2 py-0.5 rounded-md text-sm font-bold tabular-nums text-center min-w-12 ${
            played ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
          }`}
        >
          {played ? `${match.homeScore}:${match.awayScore}` : (match.time ?? '-:-')}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {match.awayLogoUrl && (
            <img src={match.awayLogoUrl} alt="" className="h-6 w-6 object-contain shrink-0" loading="lazy" />
          )}
          <TeamName name={match.awayTeam} />
        </div>
      </div>

      {/* Badge natjecanja */}
      <div className="hidden sm:block shrink-0">
        {isCup && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-orange-100 text-orange-600">
            Kup
          </span>
        )}
        {match.status === 'postponed' && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-gray-100 text-gray-500">
            Odgođeno
          </span>
        )}
      </div>
    </div>
  )

  if (played && match.matchId !== null) {
    return (
      <Link
        to={`/utakmice/${match.matchId}`}
        className="block bg-white rounded-xl border border-gray-100 hover:border-orange-300 hover:shadow-sm transition-all"
      >
        {inner}
      </Link>
    )
  }

  return <div className="bg-white rounded-xl border border-gray-100">{inner}</div>
}
