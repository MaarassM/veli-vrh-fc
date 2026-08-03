import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Bell } from "lucide-react";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  const navigate = useNavigate();

  // Otvori panel obavijesti (PushBell sluša); fallback na stranicu s uputama
  function openNotifications() {
    const event = new CustomEvent("nkvv:open-push", { cancelable: true });
    window.dispatchEvent(event);
    if (!event.defaultPrevented) navigate("/obavijesti");
  }

  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[80vh] lg:min-h-[90vh] flex flex-col">

      {/* Background photo — positioned slightly higher on larger screens */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero.webp')",
          backgroundPosition: "center 30%",
        }}
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
          <Button onClick={openNotifications} variant="primary" size="md" icon={Bell}>
            Prati rezultate
          </Button>
          <Button href="/utakmice" variant="outline-white" size="md">
            Utakmice
          </Button>
          <Button href="/novosti" variant="outline-white" size="md">
            Novosti
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
