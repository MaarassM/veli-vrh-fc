import { motion } from "motion/react";
import { MapPin, Users, Maximize } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

const stadiumFeatures = [
  {
    icon: MapPin,
    label: "Lokacija",
    value: "Veli Vrh, Pula",
    description: "Tivoli 1",
  },
  {
    icon: Maximize,
    label: "Dimenzije",
    value: "100m × 64m",
    description: "Standardno igralište",
  },
  {
    icon: Users,
    label: "Kapacitet",
    value: "200 gledatelja",
    description: "Tribine",
  },
];

const facilities = [
  "Prirodni travnjak sa sustavom navodnjavanja",
  "LED reflektori za noćne utakmice",
  "Svlačionice za domaće i gostujuće ekipe",
  "Prostor za suce i delegata",
  "Skladište opreme",
];

export default function StadiumInfo() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Naše igralište" />

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
                  <span className="text-white/95 leading-relaxed">
                    {facility}
                  </span>
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
          ></motion.div>
        </div>
      </div>
    </section>
  );
}
