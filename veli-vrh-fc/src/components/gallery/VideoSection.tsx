import { motion } from 'motion/react'
import SectionHeader from '@/components/ui/SectionHeader'
import { Play, ExternalLink } from 'lucide-react'

const featuredVideos = [
  {
    id: 'video-1',
    title: 'Highlights: Finalna utakmica Kupa 2024',
    thumbnail: '/images/placeholder.jpg',
    duration: '5:24',
    url: '#',
  },
  {
    id: 'video-2',
    title: 'Reportaža: Sezona 2023/24',
    thumbnail: '/images/placeholder.jpg',
    duration: '8:15',
    url: '#',
  },
  {
    id: 'video-3',
    title: 'Tour: Renovirano igralište',
    thumbnail: '/images/placeholder.jpg',
    duration: '3:42',
    url: '#',
  },
]

export default function VideoSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Video zapisi"
          subtitle="Najzanimljiviji video sadržaji sa naših utakmica i događaja"
        />

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVideos.map((video, index) => (
            <motion.a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-200 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  <div className="bg-orange-500 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white" fill="white" />
                  </div>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                  {video.duration}
                </div>
              </div>

              {/* Video info */}
              <div className="p-5">
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-2 group-hover:text-orange-500 transition-colors flex items-start justify-between gap-2">
                  <span>{video.title}</span>
                  <ExternalLink className="w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">
            Više video sadržaja pronađite na našem YouTube kanalu
          </p>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Play className="w-5 h-5" fill="white" />
            NK Veli Vrh YouTube
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
