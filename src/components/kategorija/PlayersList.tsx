import { motion } from 'motion/react'
import type { KategorijaPlayer } from '@/hooks/useKategorija'

interface PlayersListProps {
  players: KategorijaPlayer[]
}

export default function PlayersList({ players }: PlayersListProps) {
  if (players.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8 text-sm">
        Podaci još nisu dostupni.
      </p>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Igrač</th>
              <th className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell">Pozicija</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Nastupi</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Golovi</th>
              <th className="px-4 py-3 text-center text-sm font-semibold hidden sm:table-cell">Žuti</th>
              <th className="px-4 py-3 text-center text-sm font-semibold hidden sm:table-cell">Crveni</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <motion.tr
                key={`${p.number}-${p.firstName}-${p.lastName}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-lg">
                    {p.number}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-gray-900">
                    {p.firstName} {p.lastName}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm hidden sm:table-cell">{p.position}</td>
                <td className="px-4 py-3 text-center text-gray-700">{p.appearances}</td>
                <td className="px-4 py-3 text-center font-semibold text-orange-500">{p.goals}</td>
                <td className="px-4 py-3 text-center text-yellow-500 hidden sm:table-cell">{p.yellowCards}</td>
                <td className="px-4 py-3 text-center text-red-500 hidden sm:table-cell">{p.redCards}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
