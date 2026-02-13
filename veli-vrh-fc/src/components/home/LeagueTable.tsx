import { motion } from "motion/react";
import { useStandings } from "@/hooks/useHNSData";

export default function LeagueTable() {
  const { data: standings, loading, error } = useStandings();

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8"></div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !standings) {
    return (
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>Greška pri učitavanju tablice: {error || "Nema podataka"}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Trenutna ljestvica seniora
          </h2>{" "}
          <p className="text-lg text-gray-600">ELITNA LIGA NSŽI 25/26</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
        >
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Klub
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    U
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    P
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    N
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    I
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    GD
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    GR
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    B
                  </th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, index) => (
                  <motion.tr
                    key={team.team}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`border-b border-gray-200 last:border-b-0 ${
                      team.team === "NK Veli Vrh"
                        ? "bg-orange-50 font-semibold"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-4 text-gray-900">{team.position}</td>
                    <td className="px-4 py-4 text-gray-900">{team.team}</td>
                    <td className="px-4 py-4 text-center text-gray-600">
                      {team.played}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">
                      {team.wins}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">
                      {team.draws}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">
                      {team.losses}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">
                      {team.goalsFor}:{team.goalsAgainst}
                    </td>
                    <td
                      className={`px-4 py-4 text-center font-semibold ${
                        team.goalDifference > 0
                          ? "text-green-600"
                          : team.goalDifference < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      {team.goalDifference > 0 ? "+" : ""}
                      {team.goalDifference}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-gray-900">
                      {team.points}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {standings.map((team, index) => (
              <motion.div
                key={team.team}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`p-4 ${
                  team.team === "NK Veli Vrh" ? "bg-orange-50" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-bold text-gray-900">
                      {team.position}
                    </span>
                    <span
                      className={`font-semibold ${
                        team.team === "NK Veli Vrh"
                          ? "text-orange-500"
                          : "text-gray-900"
                      }`}
                    >
                      {team.team}
                    </span>
                  </div>
                  <span className="font-display text-xl font-bold text-gray-900">
                    {team.points}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {team.played}
                    </div>
                    <div>Utakmica</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {team.wins}-{team.draws}-{team.losses}
                    </div>
                    <div>P-N-I</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {team.goalsFor}:{team.goalsAgainst}
                    </div>
                    <div>Golovi</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-semibold ${
                        team.goalDifference > 0
                          ? "text-green-600"
                          : team.goalDifference < 0
                            ? "text-red-600"
                            : "text-gray-900"
                      }`}
                    >
                      {team.goalDifference > 0 ? "+" : ""}
                      {team.goalDifference}
                    </div>
                    <div>Razlika</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          <p>
            U - Utakmice | P - Pobjede | N - Neriješeno | I - Izgubljeno | GD -
            Dani golovi | GR - Gol razlika | B - Bodovi
          </p>
        </motion.div>
      </div>
    </section>
  );
}
