import { motion } from 'motion/react'
import type { Standing } from '@/hooks/useKategorija'

interface StandingsTableProps {
  standings: Standing[]
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8 text-sm">
        Podaci još nisu dostupni.
      </p>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 text-white">
            <tr>
              {['#', 'Klub', 'U', 'P', 'N', 'I', 'GD', 'GR', 'B'].map(h => (
                <th
                  key={h}
                  className={`px-4 py-3 text-sm font-semibold ${h === 'Klub' ? 'text-left' : 'text-center'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((team, i) => (
              <motion.tr
                key={team.team}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={`border-b border-gray-100 last:border-b-0 ${
                  team.team === 'NK Veli Vrh' ? 'bg-orange-50 font-semibold' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-gray-900">{team.position}</td>
                <td className="px-4 py-3 text-gray-900">{team.team}</td>
                <td className="px-4 py-3 text-center text-gray-600">{team.played}</td>
                <td className="px-4 py-3 text-center text-gray-600">{team.wins}</td>
                <td className="px-4 py-3 text-center text-gray-600">{team.draws}</td>
                <td className="px-4 py-3 text-center text-gray-600">{team.losses}</td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {team.goalsFor}:{team.goalsAgainst}
                </td>
                <td className={`px-4 py-3 text-center font-semibold ${
                  team.goalDifference > 0 ? 'text-green-600' :
                  team.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">{team.points}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {standings.map((team, i) => (
          <motion.div
            key={team.team}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className={`p-4 ${team.team === 'NK Veli Vrh' ? 'bg-orange-50' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">{team.position}</span>
                <span className={`font-semibold ${team.team === 'NK Veli Vrh' ? 'text-orange-500' : 'text-gray-900'}`}>
                  {team.team}
                </span>
              </div>
              <span className="font-bold text-gray-900 text-lg">{team.points}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-xs text-gray-500">
              <div className="text-center"><div className="font-semibold text-gray-800">{team.played}</div><div>Ut.</div></div>
              <div className="text-center"><div className="font-semibold text-gray-800">{team.wins}-{team.draws}-{team.losses}</div><div>P-N-I</div></div>
              <div className="text-center"><div className="font-semibold text-gray-800">{team.goalsFor}:{team.goalsAgainst}</div><div>Golovi</div></div>
              <div className="text-center">
                <div className={`font-semibold ${team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </div>
                <div>GR</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
