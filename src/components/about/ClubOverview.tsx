import { motion } from "motion/react";
import { Users, Heart } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

const stats = [
  {
    icon: Users,
    value: "150+",
    label: "Članova",
    description: "Aktivnih članova kluba",
  },
  {
    icon: Heart,
    value: "50+",
    label: "Godina",
    description: "Od 1975. do danas",
  },
];

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
              <strong className="text-orange-500">NK Veli Vrh</strong> osnovan je
              21. ožujka 1975. u istoimenom pulskom naselju. Do tada na Velom Vrhu
              nije bilo pravog sportskog terena — igralo se na improviziranom
              igralištu na Monte Lešu i betonskoj ploči u Valamarinu, a klub je
              svoje igralište podigao na mjestu bivšeg kamenoloma.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Prvu utakmicu odigrali smo 14. rujna 1975. i pobijedili NK Šišan
              1:0. Kroz pola stoljeća prošli smo put od međuopćinske lige do
              saveznog ranga, a najveći uspjeh ostvarili smo sezone 2022./23.
              trećim mjestom u 4. NL NS Rijeka.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Danas se natječemo u{" "}
              <strong>Elitnoj ligi NSŽI</strong>, najvišem rangu županijskog
              nogometa, s momčadima u svim uzrastima — od škole nogometa do
              veterana. Igralište Tivoli u obnovi je vrijednoj 830.000 eura.
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
                <stat.icon
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
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
