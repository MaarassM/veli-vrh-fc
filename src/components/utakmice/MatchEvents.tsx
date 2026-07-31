import type { MatchEvent } from '@/hooks/useMatch'

interface Props {
  events: MatchEvent[]
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case 'goal':
    case 'penalty':
      return <span title="Gol">⚽</span>
    case 'own_goal':
      return <span title="Autogol" className="grayscale">⚽</span>
    case 'yellow':
      return <span className="inline-block h-3.5 w-2.5 rounded-[2px] bg-yellow-400" title="Žuti karton" />
    case 'second_yellow':
      return <span className="inline-block h-3.5 w-2.5 rounded-[2px] bg-gradient-to-br from-yellow-400 to-red-500" title="Drugi žuti" />
    case 'red':
      return <span className="inline-block h-3.5 w-2.5 rounded-[2px] bg-red-500" title="Crveni karton" />
    case 'substitutionIn':
      return <span className="text-green-500 font-bold" title="Ušao">▲</span>
    case 'substitutionOut':
      return <span className="text-red-400 font-bold" title="Izašao">▼</span>
    default:
      return <span>•</span>
  }
}

function typeSuffix(event: MatchEvent): string | null {
  if (event.type === 'own_goal') return '(ag)'
  if (event.type === 'penalty') return '(11m)'
  return null
}

export default function MatchEvents({ events }: Props) {
  // Izmjene "ušao" prikazujemo uz "izašao" vizualno kroz redoslijed minuta — bez parova
  const sorted = [...events].sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))

  if (sorted.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-6">Nema zabilježenih događaja.</p>
  }

  return (
    <ul className="space-y-1">
      {sorted.map((event, i) => {
        const suffix = typeSuffix(event)
        const row = (
          <div className="flex items-center gap-2 text-sm">
            <EventIcon type={event.type} />
            <span className="text-gray-800">{event.playerName}</span>
            {suffix && <span className="text-gray-400 text-xs">{suffix}</span>}
          </div>
        )
        return (
          <li key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-1">
            <div className="flex justify-end">{event.team === 'home' ? row : null}</div>
            <div className="text-xs font-bold text-gray-400 tabular-nums w-8 text-center">
              {event.minute !== null ? `${event.minute}'` : ''}
            </div>
            <div className="flex justify-start">{event.team === 'away' ? row : null}</div>
          </li>
        )
      })}
    </ul>
  )
}
