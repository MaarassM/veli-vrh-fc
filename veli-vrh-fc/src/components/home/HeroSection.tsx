import { motion } from 'motion/react'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(/images/team-celebration.jpg)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.img
          src="/images/logo.png"
          alt="NK Veli Vrh"
          className="h-24 sm:h-32 mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          NK Veli Vrh
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Više od kluba. Tradicija, zajednica i strast prema nogometu iz srca Istre.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button href="/team" variant="primary" size="lg">
            Upoznaj momčad
          </Button>
          <Button href="/about" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
            O klubu
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
