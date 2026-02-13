import { motion } from "motion/react";
import { MapPin } from "lucide-react";

export default function MapPlaceholder() {
  // Embed URL for NK Veli Vrh stadium location
  const embedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2827.9!2d13.85!3d44.87!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x477cd3c0d1e0c0c1%3A0x1!2sVeli%20Vrh%201%2C%2052100%2C%20Pula!5e0!3m2!1shr!2shr!4v1234567890";

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-center"
        >
          <div className="inline-flex items-center gap-2 text-orange-500 mb-2">
            <MapPin className="w-6 h-6" />
            <h3 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
              Pronađite nas
            </h3>
          </div>
          <p className="text-gray-600">
            NK Veli Vrh • Veli Vrh 1, 52100 Pula, Hrvatska
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden shadow-xl aspect-video md:aspect-[21/9]"
        >
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="NK Veli Vrh Location"
            className="absolute inset-0 w-full h-full"
          />
        </motion.div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <a
            href="https://maps.google.com/?q=Veli+Vrh+1,+52100+Pula,+Hrvatska"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Otvori u Google Maps
          </a>
        </motion.div>
      </div>
    </section>
  );
}
