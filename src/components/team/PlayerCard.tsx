import type { Player } from '@/types'

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[3/2] flex items-center justify-center bg-gray-900">
        {player.number !== null ? (
          <span
            className="heading-club text-6xl text-white/90 tabular-nums leading-none"
            aria-label={`Broj dresa ${player.number}`}
          >
            {player.number}
          </span>
        ) : (
          <span className="heading-club text-4xl text-white/40 leading-none" aria-hidden="true">
            {player.firstName[0]}
            {player.lastName[0]}
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-bold text-gray-900 leading-tight truncate" style={{ fontFamily: 'var(--font-display)' }}>
          {player.firstName} {player.lastName}
        </h3>
        {player.position && <p className="text-xs text-gray-400 mt-0.5">{player.position}</p>}
      </div>
    </div>
  )
}
