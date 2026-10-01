import { motion } from "motion/react";
import { Users, Heart } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import RichText from "@/components/ui/RichText";
import { useSiteContent } from "@/hooks/useSiteContent";

const icons = [Users, Heart];

export default function ClubOverview() {
  const { subtitle, paragraphs, stats } = useSiteContent("about_overview");
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="O nama"
          subtitle={subtitle}
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
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={i === 0 ? "text-lg text-gray-700 leading-relaxed" : "text-gray-600 leading-relaxed"}
              >
                <RichText text={paragraph} boldClassName={i === 0 ? "text-orange-500" : undefined} />
              </p>
            ))}
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = icons[index % icons.length];
              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"
              >
                <Icon
                  className="w-8 h-8 text-orange-500 mx-auto mb-4"
                  strokeWidth={1.5}
                />
                <div className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
