import { motion } from "motion/react";
import { Heart, Users, Star } from "lucide-react";

const values = [
  {
    Icon: Heart,
    title: "Tradicija",
    body: "Klub ukorijenjen u pulskoj četvrti Veli Vrh, čuvar lokalne nogometne kulture kroz desetljeća.",
  },
  {
    Icon: Users,
    title: "Zajednica",
    body: "Više od kluba — mjesto gdje se susreću generacije, obitelji i susjedi oko zajedničke strasti.",
  },
  {
    Icon: Star,
    title: "Mladi naraštaji",
    body: "Ulaganje u razvoj mladih igrača, jer budućnost kluba počinje na omladinskim treninzima.",
  },
];

export default function ClubValues() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Naše vrijednosti
          </h2>
          <p className="text-lg text-gray-500">Što NK Veli Vrh čini posebnim</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-8 border border-gray-100 hover:border-orange-200 rounded-xl transition-all duration-200 cursor-default"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors duration-200">
                <Icon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">
                {title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
