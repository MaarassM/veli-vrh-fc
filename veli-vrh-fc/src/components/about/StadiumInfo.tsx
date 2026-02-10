import { motion } from 'motion/react'
import { MapPin, Users, Calendar, Maximize } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

const stadiumFeatures = [
  {
    icon: MapPin,
    label: 'Lokacija',
    value: 'Veli Vrh, Pula',
    description: 'U središtu naselja',
  },
  {
    icon: Maximize,
    label: 'Dimenzije',
    value: '100m × 64m',
    description: 'Standardno igralište',
  },
  {
    icon: Users,
    label: 'Kapacitet',
    value: '500 gledatelja',
    description: 'Tribine i praćenje',
  },
  {
    icon: Calendar,
    label: 'Obnova',
    value: '2022. godina',
    description: 'Potpuna renovacija',
  },
]

const facilities = [
  'Prirodni travnjak s modernim odvodnjom',
  'LED reflektori za noćne utakmice',
  'Renovirane svlačionice za domaće i goste',
  'Suvremene tribine s natkriveним sjedalima',
  'Prostor za medicinsko osoblje',
  'Tehnička prostorija i skladište opreme',
]

export default function StadiumInfo() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Naše igralište"
          subtitle="Dom NK Veli Vrh — mjesto gdje se događa nogometna čarolija"
        />

        <div className="mt-12 md:mt-16 space-y-12">
          {/* Stadium features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stadiumFeatures.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-6"
              >
                <feature.icon
                  className="w-10 h-10 text-orange-500 mb-4"
                  strokeWidth={1.5}
                />
                <div className="font-display text-2xl font-bold text-gray-900 mb-1">
                  {feature.value}
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  {feature.label}
                </div>
                <div className="text-sm text-gray-600">
                  {feature.description}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Facilities list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white"
          >
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-6">
              Infrastruktura
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {facilities.map((facility, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="text-white/95 leading-relaxed">{facility}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-gray-600 leading-relaxed">
              Naše igralište na Velom Vrhu prošlo je kroz temeljitu renovaciju 2022. godine.
              Danas ponositmo sa modernom infrastrukturom koja osigurava sigurnost igrača
              i vrhunske uvjete za sve uzrasne kategorije. Igralište nije samo sportski
              objekt — to je srce naše zajednice i dom našeg kluba.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
