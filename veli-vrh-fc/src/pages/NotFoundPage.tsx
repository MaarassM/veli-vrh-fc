import { Link } from 'react-router'
import { motion } from 'motion/react'
import { Home } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.h1
          className="font-display text-8xl md:text-9xl font-bold text-orange-500 mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
        >
          404
        </motion.h1>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
          Stranica nije pronađena
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Stranica koju tražite ne postoji ili je premještena.
        </p>
        <Link to="/">
          <Button icon={Home}>
            Povratak na početnu
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
