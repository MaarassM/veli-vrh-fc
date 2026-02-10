import { motion } from 'motion/react'
import { Trophy, Users, Heart, Target } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

const stats = [
  {
    icon: Trophy,
    value: '15+',
    label: 'Trofeji',
    description: 'Osvojeno natjecanja',
  },
  {
    icon: Users,
    value: '150+',
    label: 'Članova',
    description: 'Aktivnih članova kluba',
  },
  {
    icon: Heart,
    value: '57',
    label: 'Godina',
    description: 'Tradicije i strasti',
  },
  {
    icon: Target,
    value: '100%',
    label: 'Predanost',
    description: 'Razvoju mladih talenata',
  },
]

export default function ClubOverview() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="O nama"
          subtitle="Nogometni klub s dugom tradicijom i velikom strašću"
        />

        <div className="mt-12 md:mt-16 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong className="text-orange-500">NK Veli Vrh</strong> je nogometni klub osnovan 1967. godine u
              pulskom naselju Veli Vrh. Više od pola stoljeća klubujemo u srcu Istre, njegujući
              vrijednosti zajedništva, fair-playa i ljubavi prema nogometu.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Naš klub je ponos lokalne zajednice — mjesto gdje se generacije susreću,
              gdje se mladi igrači razvijaju u sportiste i ljude karaktera, i gdje svaki
              meč postaje slavlje nogometne strasti.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Danas natječemo u <strong>1. Županijskoj nogometnoj ligi Istarske županije</strong>,
              s ambicijom daljnjeg razvoja kroz ulaganje u omladinsku školu i modernizaciju
              infrastrukture.
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-orange-500 mx-auto mb-4" strokeWidth={1.5} />
                <div className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
