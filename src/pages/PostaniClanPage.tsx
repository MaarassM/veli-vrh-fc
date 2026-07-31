import { motion } from 'motion/react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { contactInfo } from '@/data/contact'
import SEO from '@/components/seo/SEO'

// TODO-korisnik: provjeri termine treninga, uzraste i telefonski broj
const groups = [
  {
    title: 'Škola nogometa',
    ages: 'U-9 i U-11',
    description:
      'Najmlađi počinju s igrom, osnovama tehnike i ljubavlju prema nogometu. Treninzi prilagođeni uzrastu, uz licencirane trenere.',
  },
  {
    title: 'Mlađi uzrasti',
    ages: 'Mlađi pioniri, pioniri i juniori',
    description:
      'Ozbiljniji rad, natjecanja u županijskim ligama i razvoj igrača prema seniorskom nogometu.',
  },
  {
    title: 'Seniori i veterani',
    ages: '18+',
    description:
      'Seniorska momčad natječe se u Elitnoj ligi NSŽI, a veterani u ligi Veterani JUG. Uvijek tražimo pojačanja!',
  },
]

export default function PostaniClanPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO
        title="Postani član | NK Veli Vrh"
        description="Upiši se u školu nogometa NK Veli Vrh ili se priključi seniorima. Treniramo na stadionu Tivoli u Puli."
        canonicalPath="/postani-clan"
      />
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Postani dio kluba
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Od prvih koraka s loptom do seniorskog dresa — NK Veli Vrh otvoren je
            za sve generacije. Dođi na trening i uvjeri se!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {groups.map((group, i) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2
                className="text-xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {group.title}
              </h2>
              <p className="text-sm font-semibold text-orange-500 mb-3">{group.ages}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{group.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-900 text-white rounded-2xl p-8 text-center"
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Javi nam se
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <a
              href={`mailto:${contactInfo.email}?subject=Upis u NK Veli Vrh`}
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-semibold"
            >
              <Mail className="h-4 w-4" /> {contactInfo.email}
            </a>
            <span className="inline-flex items-center gap-2 text-gray-300">
              <Phone className="h-4 w-4" /> 052/215-471
            </span>
            <span className="inline-flex items-center gap-2 text-gray-300">
              <MapPin className="h-4 w-4" /> Stadion Tivoli, Veli Vrh, Pula
            </span>
          </div>
          <p className="mt-6 text-xs text-gray-400">
            Pošalji nam poruku s imenom i godištem djeteta ili se jednostavno pojavi
            na treningu — sve informacije rado dajemo uživo.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
