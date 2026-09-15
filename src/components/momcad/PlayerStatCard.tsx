interface PlayerStat {
  firstName: string
  lastName: string
  number: number
  position: string
  goals: number
  appearances: number
  yellowCards: number
  redCards: number
  imageUrl: string | null
}

interface Props {
  player: PlayerStat
}

export default function PlayerStatCard({ player }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[3/2] flex items-center justify-center bg-gray-900">
        <span
          className="heading-club text-6xl text-white/90 tabular-nums leading-none"
          aria-label={`Broj dresa ${player.number}`}
        >
          {player.number}
        </span>
      </div>

      <div className="p-3">
        <h3 className="font-bold text-gray-900 leading-tight truncate" style={{ fontFamily: 'var(--font-display)' }}>
          {player.firstName} {player.lastName}
        </h3>
        <p className="text-xs text-gray-400 mb-2">{player.position}</p>

        <div className="grid grid-cols-3 gap-1 text-center text-xs">
          <div className="bg-gray-50 rounded-md py-1">
            <div className="font-bold text-gray-900 tabular-nums">{player.appearances}</div>
            <div className="text-gray-400 text-[10px]">Nastupi</div>
          </div>
          <div className="bg-gray-50 rounded-md py-1">
            <div className="font-bold text-gray-900 tabular-nums">{player.goals}</div>
            <div className="text-gray-400 text-[10px]">Golovi</div>
          </div>
          <div className="bg-gray-50 rounded-md py-1">
            <div className="font-bold tabular-nums">
              <span className="text-yellow-500">{player.yellowCards}</span>
              <span className="text-gray-300">/</span>
              <span className="text-red-500">{player.redCards}</span>
            </div>
            <div className="text-gray-400 text-[10px]">Kartoni</div>
          </div>
        </div>
      </div>
    </div>
  )
}
