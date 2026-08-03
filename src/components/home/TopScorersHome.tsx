import { motion } from "motion/react";
import { Link } from "react-router";
import { useTopScorers } from "@/hooks/useHNSData";

export default function TopScorersHome() {
  const { data: scorers, loading } = useTopScorers(3);

  if (loading || scorers.length === 0) return null;

  return (
    <section className="bg-[#111111] py-14">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[4px] text-orange-500 mb-6 text-center"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Naši najbolji strijelci
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {scorers.map((p, i) => (
              <div key={`${p.firstName}-${p.lastName}`} className="flex items-center gap-4">
                <span
                  className="text-5xl font-black italic text-white/15 tabular-nums shrink-0"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {i + 1}
                </span>
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={`${p.firstName} ${p.lastName}`}
                    className="h-14 w-14 rounded-full object-cover object-top bg-white/10 shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <span className="h-14 w-14 rounded-full bg-white/10 shrink-0" />
                )}
                <div className="min-w-0">
                  <div
                    className="text-white font-bold uppercase italic truncate"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-sm text-orange-400 font-semibold tabular-nums">
                    {p.goals} {p.goals === 1 ? "gol" : p.goals < 5 ? "gola" : "golova"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/statistika"
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-orange-400 transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Cijela statistika →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
