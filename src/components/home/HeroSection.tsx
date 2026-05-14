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

      {/* Bottom fade to white */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, transparent, #ffffff)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[540px] py-16 px-6">
        <motion.span
          className="block mb-5 text-orange-500 uppercase tracking-[5px] text-[10px] font-bold"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          — Pula · Istra —
        </motion.span>

        <motion.img
          src="/images/logo.png"
          alt="NK Veli Vrh"
          className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] object-contain mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        <motion.p
          className="text-[14px] text-gray-500 leading-relaxed max-w-[280px] mb-8"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Tradicija, zajednica i strast prema nogometu iz srca Istre.
        </motion.p>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button href="/about" variant="outline" size="md">
            O Klubu
          </Button>
          <a
            href="/team"
            className="font-semibold text-[13px] text-gray-400 hover:text-orange-500 transition-colors duration-200"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Momčad →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
