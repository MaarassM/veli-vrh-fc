import { motion } from "motion/react";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: "#fff8f3" }}>

      {/* Background blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 380, height: 380, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.28) 0%, transparent 65%)",
          top: -130, left: -110,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,146,60,0.22) 0%, transparent 65%)",
          bottom: -90, right: -70,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(253,186,116,0.25) 0%, transparent 65%)",
          top: 10, right: 30,
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, transparent, #ffffff)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[600px] pt-32 pb-16 px-6">

        <motion.span
          className="block mb-3 text-orange-500 uppercase tracking-[5px] text-[10px] font-bold"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          — Pula · Istra —
        </motion.span>

        {/* Club name — italic condensed like NK Kustošija */}
        <motion.div
          className="flex flex-col items-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1
            className="text-[72px] md:text-[108px] font-black italic uppercase leading-none tracking-tight text-gray-900"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            NK VELI VRH
          </h1>
        </motion.div>

        <motion.p
          className="text-[14px] text-gray-500 leading-relaxed max-w-[300px] mb-10"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          Tradicija, zajednica i strast prema nogometu iz srca Istre.
        </motion.p>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Button href="/about" variant="outline" size="md">
            O Klubu
          </Button>
          <Button href="/novosti" variant="primary" size="md">
            Novosti
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
