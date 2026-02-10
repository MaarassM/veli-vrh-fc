import { motion } from 'motion/react'
import SectionHeader from '@/components/ui/SectionHeader'
import { timelineEvents } from '@/data/timeline'
import { Trophy, Star } from 'lucide-react'

export default function MomentsTimeline() {
  // Filter only achievement events
  const achievementEvents = timelineEvents.filter(
    (event) => event.category === 'achievement'
  )

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Nezaboravni trenutci"
          subtitle="Najvažniji uspjesi i prekretnice u povijesti NK Veli Vrh"
        />

        <div className="mt-12 md:mt-16 relative">
          {/* Center vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500/20 via-orange-500/60 to-orange-500/20 -translate-x-1/2 hidden md:block" />

          {/* Timeline items */}
          <div className="space-y-12">
            {achievementEvents.map((event, index) => {
              const isEven = index % 2 === 0

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center gap-8 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content card */}
                  <div className="flex-1 md:w-1/2">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all ${
                        isEven ? 'md:text-right' : 'md:text-left'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3 md:justify-end">
                        <Trophy className="w-5 h-5 text-orange-500" />
                        <span className="font-display font-bold text-2xl text-orange-500">
                          {event.year}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-xl text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {event.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center dot (visible on desktop) */}
                  <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', delay: index * 0.1 + 0.2 }}
                      className="w-4 h-4 bg-orange-500 rounded-full ring-4 ring-white shadow-lg"
                    />
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden md:block flex-1 md:w-1/2" />
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom star decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', duration: 0.8, delay: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-xl">
            <Star className="w-8 h-8" fill="currentColor" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
