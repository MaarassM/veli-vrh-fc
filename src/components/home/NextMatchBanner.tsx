import { motion } from "motion/react";
import { useMatches } from "@/hooks/useHNSData";

function formatMatchDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("hr-HR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NextMatchBanner() {
  const { data: matches, loading } = useMatches();

  if (loading) {
    return (
      <div className="py-6 bg-white">
        <div className="mx-auto max-w-lg px-4">
          <div className="animate-pulse rounded-xl bg-gray-100 h-28" />
        </div>
      </div>
    );
  }

  const next = matches.find((m) => m.status === "upcoming");
  if (!next) return null;

  const isHome = next.venue === "home";

  return (
    <motion.section
      className="py-6 bg-white"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-lg px-4">
        <div className="rounded-xl border border-gray-100 shadow-sm bg-white px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[4px] text-orange-500 mb-3">
            Sljedeća utakmica seniora
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-lg font-bold text-gray-900 leading-tight">
              {next.homeTeam}
            </span>
            <span className="text-sm font-semibold text-gray-400">vs</span>
            <span className="text-lg font-bold text-gray-900 leading-tight text-right">
              {next.awayTeam}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{formatMatchDate(next.date)}</span>
            <span className="text-gray-300">·</span>
            <span>{next.competition}</span>
            <span className="text-gray-300">·</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isHome
                  ? "bg-orange-100 text-orange-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isHome ? "Domaćin" : "Gost"}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
