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
      <div className="relative bg-gray-50">
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={`${player.firstName} ${player.lastName}`}
            className="w-full aspect-[4/5] object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[4/5] flex items-center justify-center text-gray-300">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12Zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8Z" />
            </svg>
          </div>
        )}
        <span
          className="absolute top-2 right-2 bg-gray-900/80 text-white text-lg font-black rounded-lg px-2 py-0.5 tabular-nums"
          style={{ fontFamily: 'var(--font-display)' }}
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
