import { motion } from 'motion/react'
import { MapPin, Mail, Phone, Clock } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import { contactInfo } from '@/data/contact'

const contactItems = [
  {
    icon: MapPin,
    label: 'Adresa',
    value: `${contactInfo.address.street}, ${contactInfo.address.postalCode} ${contactInfo.address.city}`,
    href: `https://maps.google.com/?q=${encodeURIComponent(
      `${contactInfo.address.street}, ${contactInfo.address.city}`
    )}`,
  },
  {
    icon: Mail,
    label: 'Email',
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
  },
  {
    icon: Phone,
    label: 'Telefon',
    value: contactInfo.phone,
    href: `tel:${contactInfo.phone.replace(/\s/g, '')}`,
  },
  {
    icon: Clock,
    label: 'Radno vrijeme',
    value: contactInfo.officeHours,
    href: null,
  },
]

export default function ContactDetails() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Kontaktirajte nas"
          subtitle="Javite nam se za pitanja, prijedloge ili informacije o članstvu"
        />

        <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact cards */}
          <div className="space-y-6">
            {contactItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={item.href ? { x: 4 } : {}}
                className="group"
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.icon === MapPin ? '_blank' : undefined}
                    rel={item.icon === MapPin ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-4 p-6 bg-gray-50 border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        {item.label}
                      </div>
                      <div className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">
                        {item.value}
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-start gap-4 p-6 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        {item.label}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {item.value}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Info text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">
                Pridružite se NK Veli Vrh
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Zainteresirani ste za članstvo, sponzorstvo ili volontiranje u našem klubu?
                Obratite nam se putem e-maila ili telefona.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Naša omladinska škola nogometa prima nove polaznike tijekom cijele godine.
                Za više informacija o upisu, kontaktirajte našeg voditelja omladinske sekcije.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
              <h4 className="font-display font-semibold text-lg mb-2">
                Podrška klubu
              </h4>
              <p className="text-white/90 leading-relaxed">
                Vaša podrška pomaže razvoju mladih nogometaša i održavanju klupske
                infrastrukture. Svaka donacija je dobrodošla!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
