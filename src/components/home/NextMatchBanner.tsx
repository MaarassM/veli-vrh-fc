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
      <div className="py-10 px-6" style={{ background: "#f5e8d8" }}>
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-10 bg-white/30 rounded w-64 mb-4" />
          <div className="h-4 bg-white/30 rounded w-48" />
        </div>
      </div>
    );
  }

  const next = matches.find((m) => m.status === "upcoming");
  if (!next) return null;

  return (
    <motion.section
      style={{ background: "#f5e8d8" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Desktop: two-column | Mobile: stacked */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

          {/* Left — heading + meta */}
          <div className="flex-1">
            <h2
              className="text-4xl md:text-5xl font-black italic uppercase leading-none text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Sljedeća utakmica
            </h2>
            <p className="text-sm text-gray-700 leading-snug">
              {next.competition}
            </p>
            <p className="text-sm text-gray-700 leading-snug">
              {formatMatchDate(next.date)}
              {next.venue && (
                <span className="ml-2 text-gray-500">
                  · {next.venue === "home" ? "Domaćin" : "Gost"}
                </span>
              )}
            </p>
          </div>

          {/* Right — teams */}
          <div className="flex items-center justify-center gap-6 md:gap-10">
            {/* Home team */}
            <div className="flex flex-col items-center gap-1 min-w-[80px]">
              <div
                className="w-14 h-14 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold text-gray-700 uppercase text-center leading-tight"
              >
                {next.homeTeam.split(" ").map(w => w[0]).join("").slice(0, 3)}
              </div>
              <span
                className="text-xs font-bold uppercase tracking-wide text-center text-gray-900 leading-tight max-w-[80px]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {next.homeTeam}
              </span>
            </div>

            {/* VS */}
            <span
              className="text-3xl md:text-4xl font-black italic text-gray-900"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              VS
            </span>

            {/* Away team */}
            <div className="flex flex-col items-center gap-1 min-w-[80px]">
              <div
                className="w-14 h-14 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold text-gray-700 uppercase text-center leading-tight"
              >
                {next.awayTeam.split(" ").map(w => w[0]).join("").slice(0, 3)}
              </div>
              <span
                className="text-xs font-bold uppercase tracking-wide text-center text-gray-900 leading-tight max-w-[80px]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {next.awayTeam}
              </span>
            </div>
          </div>

        </div>
      </div>
    </motion.section>
  );
}
