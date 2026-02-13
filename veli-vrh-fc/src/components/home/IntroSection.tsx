import { motion } from "motion/react";
import Button from "../ui/Button";

export default function IntroSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-lg text-gray-600 leading-relaxed">
            NK Veli Vrh je nogometni klub iz istoimenog pulskog naselja, osnovan
            s ciljem okupljanja lokalne zajednice kroz ljubav prema najljepšoj
            igri. Kroz desetljeća postojanja, klub je izrastao u simbol
            upornosti, zajedništva i istarske nogometne tradicije.
          </p>
          <Button href="/team" variant="primary" size="lg" className="mt-8">
            Upoznaj ekipu
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
