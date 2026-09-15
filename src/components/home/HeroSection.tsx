import { motion } from "motion/react";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[80vh] lg:min-h-[90vh] flex flex-col">

      {/* Background photo — landscape 3:2, so narrow screens focus the left side (corner flag + ball) */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-[position:20%_center] md:bg-[position:center_65%]"
        style={{ backgroundImage: "url('/images/hero.webp')" }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1 pt-32 pb-16 px-6">

        <motion.span
          className="block mb-3 text-orange-400 uppercase tracking-[5px] text-[10px] font-bold"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          — Pula · Istra —
        </motion.span>

        <motion.div
          className="flex flex-col items-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1
            className="text-[72px] md:text-[108px] lg:text-[130px] font-black italic uppercase leading-none tracking-tight text-white"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            NK VELI VRH
          </h1>
        </motion.div>

        <motion.p
          className="text-[14px] text-white/70 leading-relaxed max-w-[300px] mb-10"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          Tradicija, zajednica i strast prema nogometu iz srca Istre.
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Button href="/utakmice" variant="primary" size="md">
            Utakmice
          </Button>
          <Button href="/momcad" variant="outline-white" size="md">
            Momčad
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
