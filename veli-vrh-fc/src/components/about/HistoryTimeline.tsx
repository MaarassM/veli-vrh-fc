import { motion } from 'motion/react'
import SectionHeader from '@/components/ui/SectionHeader'
import TimelineItem from './TimelineItem'
import { timelineEvents } from '@/data/timeline'

export default function HistoryTimeline() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Povijest kluba"
          subtitle="Pratite ključne trenutke u razvoju NK Veli Vrh kroz godine"
        />

        <div className="relative mt-12 md:mt-16">
          {/* Vertical timeline line */}
          <div className="absolute left-[4.5rem] md:left-[5.5rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/20 via-orange-500/50 to-orange-500/20" />

          {/* Timeline events */}
          <div className="space-y-8 md:space-y-12">
            {timelineEvents.map((event, index) => (
              <TimelineItem key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-orange-500 text-white font-display font-semibold px-6 py-3 rounded-full shadow-lg">
            57+ godina tradicije
          </div>
        </motion.div>
      </div>
    </section>
  )
}
