import { motion } from "motion/react";
import { useStandings } from "@/hooks/useHNSData";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  const { data: standings } = useStandings();
  const vv = standings.find((s) => s.team === "NK Veli Vrh");

  const stats = [
    {
      num: vv ? `${vv.position}.` : "–",
      label: "Trenutno",
      title: "Pozicija u ligi",
      accent: true,
    },
    {
      num: vv ? String(vv.points) : "–",
      label: "Ukupno",
      title: "Bodova ove sezone",
      accent: false,
    },
    {
      num: vv ? String(vv.wins) : "–",
      label: "Pobjede",
      title: `Od ${vv?.played ?? "–"} utakmica`,
      accent: false,
    },
    {
      num: vv ? String(vv.goalsFor) : "–",
      label: "Golovi",
      title: "Dano ove sezone",
      accent: false,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Top gradient bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[5px] z-10"
        style={{
          background: "linear-gradient(to right, #f97316, #fb923c, #f97316)",
        }}
      />
      {/* Left orange accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-orange-500 z-10" />
      {/* Radial glow top-right */}
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
        }}
      />
      {/* Faded season number */}
      <div
        className="absolute right-6 bottom-[-30px] pointer-events-none select-none leading-none"
        style={{
          fontFamily: "var(--font-barlow-condensed)",
          fontWeight: 900,
          fontSize: "320px",
          color: "rgba(249,115,22,0.05)",
          letterSpacing: "-10px",
        }}
      >
        25
      </div>

      {/* Desktop layout */}
      <div className="relative z-10 mx-auto max-w-7xl pl-14 pr-8 hidden md:flex items-center min-h-[540px] py-16 gap-14">
        {/* Left column */}
        <div className="flex-none w-80">
          {/* Eyebrow */}
          <div
            className="flex items-center gap-2 mb-4 text-orange-500 uppercase tracking-[4px] text-[11px] font-bold"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            <span className="block w-6 h-[2px] bg-orange-500 flex-none" />
            Pula · Istra
          </div>

          {/* Club name */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              fontWeight: 900,
              lineHeight: 0.85,
              letterSpacing: "-1px",
            }}
          >
            <span className="block text-[96px] text-gray-900">NK</span>
            <span className="block text-[88px] text-orange-500">Veli</span>
            <span className="block text-[96px] text-gray-900">Vrh</span>
          </motion.div>

          <motion.p
            className="text-[15px] text-gray-500 leading-relaxed max-w-[270px] mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Tradicija, zajednica i strast prema nogometu iz srca Istre.
          </motion.p>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button href="/about" variant="primary" size="lg">
              O Klubu
            </Button>
            <a
              href="/team"
              className="font-bold text-[13px] tracking-[2px] uppercase text-gray-400 hover:text-orange-500 transition-colors duration-200 flex items-center gap-1"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Momčad →
            </a>
          </motion.div>
        </div>

        {/* Right column — stat rows */}
        <div className="flex-1 flex flex-col gap-[2px]">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="flex items-stretch border border-gray-100 bg-white"
            >
              <div className="flex-none w-[90px] flex items-center justify-center border-r-[3px] border-orange-500 py-5 px-5">
                <span
                  className={`text-[44px] font-black leading-none ${
                    s.accent ? "text-orange-500" : "text-gray-900"
                  }`}
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {s.num}
                </span>
              </div>
              <div className="flex flex-col justify-center px-5 py-4">
                <span
                  className="text-[11px] font-bold tracking-[3px] uppercase text-gray-300 mb-[2px]"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {s.label}
                </span>
                <span
                  className="text-[16px] font-semibold text-gray-700"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {s.title}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="relative z-10 md:hidden px-6 pl-10 pt-14 pb-6">
        <div
          className="flex items-center gap-2 mb-3 text-orange-500 uppercase tracking-[4px] text-[11px] font-bold"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          <span className="block w-5 h-[2px] bg-orange-500 flex-none" />
          Pula · Istra
        </div>
        <div
          className="mb-4"
          style={{
            fontFamily: "var(--font-barlow-condensed)",
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: "-1px",
          }}
        >
          <span className="block text-[72px] text-gray-900">NK</span>
          <span className="block text-[66px] text-orange-500">Veli</span>
          <span className="block text-[72px] text-gray-900">Vrh</span>
        </div>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
          Tradicija, zajednica i strast prema nogometu iz srca Istre.
        </p>
        <div className="flex items-center gap-3 mb-8">
          <Button href="/about" variant="primary" size="lg">
            O Klubu
          </Button>
          <a
            href="/team"
            className="font-bold text-[13px] tracking-[2px] uppercase text-gray-400 hover:text-orange-500 transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Momčad →
          </a>
        </div>
      </div>

      {/* Mobile stat strip */}
      <div className="md:hidden flex border-t border-gray-100">
        {stats.slice(0, 2).map((s) => (
          <div
            key={s.label}
            className="flex-1 text-center py-4 border-r last:border-r-0 border-gray-100"
          >
            <div
              className="text-[36px] font-black text-orange-500 leading-none"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {s.num}
            </div>
            <div className="text-[11px] text-gray-400 tracking-widest uppercase mt-1">
              {s.title}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
