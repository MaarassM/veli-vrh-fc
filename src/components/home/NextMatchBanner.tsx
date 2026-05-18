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
      <div className="py-12 px-6 bg-[#111111]">
        <div className="mx-auto max-w-5xl animate-pulse space-y-3">
          <div className="h-10 bg-white/10 rounded w-64" />
          <div className="h-4 bg-white/10 rounded w-48" />
        </div>
      </div>
    );
  }

  const next = matches.find((m) => m.status === "upcoming");
  if (!next) return null;

  return (
    <motion.section
      className="bg-[#111111]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">

          {/* Left — label + meta */}
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[4px] text-orange-500 mb-3"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Sljedeća utakmica seniora
            </p>
            <p className="text-sm text-gray-500 leading-snug">{next.competition}</p>
            <p className="text-sm text-gray-500 leading-snug">{formatMatchDate(next.date)}</p>
            {next.venue && (
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-white/10 text-gray-500"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                {next.venue === "home" ? "Domaćin" : "Gost"}
              </span>
            )}
          </div>

          {/* Right — team names + VS */}
          <div className="flex items-center gap-4 md:gap-8">
            <span
              className="text-2xl md:text-3xl font-black italic uppercase text-white text-right leading-tight"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {next.homeTeam}
            </span>

            <span
              className="text-xl md:text-2xl font-black italic text-white/20 shrink-0"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              VS
            </span>

            <span
              className="text-2xl md:text-3xl font-black italic uppercase text-white text-left leading-tight"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {next.awayTeam}
            </span>
          </div>

        </div>
      </div>
    </motion.section>
  );
}
