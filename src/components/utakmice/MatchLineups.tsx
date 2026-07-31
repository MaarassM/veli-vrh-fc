import type { LineupEntry } from '@/hooks/useMatch'

interface Props {
  lineups: LineupEntry[]
}

function TeamColumn({ entries, teamName }: { entries: LineupEntry[]; teamName: string }) {
  return (
    <div>
      <h3
        className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {teamName}
      </h3>
      <ul className="space-y-2">
        {entries.map((p, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="w-6 text-right text-xs font-bold text-gray-400 tabular-nums shrink-0">
              {p.number ?? ''}
            </span>
            {p.photoUrl ? (
              <img
                src={p.photoUrl}
                alt=""
                className="h-8 w-8 rounded-full object-cover bg-gray-100 shrink-0"
                loading="lazy"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-gray-100 shrink-0" />
            )}
            <span className="text-sm text-gray-800 truncate">
              {p.name}
              {p.isCaptain && <span className="ml-1 text-xs font-bold text-orange-500">(C)</span>}
            </span>
            {p.position && (
              <span className="ml-auto text-xs text-gray-400 shrink-0">{p.position}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function MatchLineups({ lineups }: Props) {
  if (lineups.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-6">Sastavi nisu dostupni.</p>
  }

  const home = lineups.filter(l => l.team === 'home')
  const away = lineups.filter(l => l.team === 'away')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      <TeamColumn entries={home} teamName={home[0]?.teamName ?? 'Domaći'} />
      <TeamColumn entries={away} teamName={away[0]?.teamName ?? 'Gosti'} />
    </div>
  )
}
