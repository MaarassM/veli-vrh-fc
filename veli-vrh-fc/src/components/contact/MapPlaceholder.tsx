import { motion } from 'motion/react'
import { MapPin, ExternalLink } from 'lucide-react'
import { contactInfo } from '@/data/contact'

export default function MapPlaceholder() {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
    `${contactInfo.address.street}, ${contactInfo.address.city}`
  )}`

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden aspect-video md:aspect-[21/9] shadow-lg"
        >
          {/* Placeholder content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="bg-orange-500 text-white p-6 rounded-full mb-6 shadow-xl"
            >
              <MapPin className="w-12 h-12" strokeWidth={1.5} />
            </motion.div>

            <h3 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Pronađite nas
            </h3>

            <p className="text-gray-600 mb-2 max-w-md">
              <strong>{contactInfo.clubName}</strong>
            </p>
            <p className="text-gray-600 mb-8 max-w-md">
              {contactInfo.address.street}, {contactInfo.address.postalCode}{' '}
              {contactInfo.address.city}, {contactInfo.address.country}
            </p>

            <motion.a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors"
            >
              <MapPin className="w-5 h-5" />
              Otvori u Google Maps
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          </div>

          {/* Decorative grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="map-grid"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid)" />
            </svg>
          </div>
        </motion.div>

        {/* Directions note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600">
            💡 Igralište se nalazi u središtu naselja Veli Vrh, lako dostupno iz centra Pule
          </p>
        </motion.div>
      </div>
    </section>
  )
}
