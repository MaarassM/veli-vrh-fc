import { motion } from 'motion/react'

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
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Dobrodošli u NK Veli Vrh
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            NK Veli Vrh je nogometni klub iz istoimenog pulskog naselja, osnovan s ciljem
            okupljanja lokalne zajednice kroz ljubav prema najljepšoj igri. Kroz desetljeća
            postojanja, klub je izrastao u simbol upornosti, zajedništva i istarske
            nogometne tradicije.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
