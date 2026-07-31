import type { RoundGroup } from '@/lib/matches'
import MatchCard from './MatchCard'

interface Props {
  group: RoundGroup
  highlight?: boolean
}

export default function RoundSection({ group, highlight = false }: Props) {
  return (
    <section>
      <h3
        className={`text-sm font-bold uppercase tracking-wider mb-2 ${
          highlight ? 'text-orange-500' : 'text-gray-400'
        }`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {group.round !== null ? `${group.round}. kolo` : 'Ostale utakmice'}
      </h3>
      <div className="space-y-2">
        {group.matches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}
