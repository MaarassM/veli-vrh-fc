import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import GalleryItem from './GalleryItem'
import SectionHeader from '@/components/ui/SectionHeader'
import { galleryItems, albums } from '@/data/gallery'
import type { Album } from '@/types'

export default function GalleryGrid() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)

  const filteredItems = selectedAlbum
    ? galleryItems.filter((item) => item.albumId === selectedAlbum.id)
    : []

  // Sort by date descending
  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {selectedAlbum ? (
          // Album detail view
          <>
            <div className="mb-8">
              <button
                onClick={() => setSelectedAlbum(null)}
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Natrag na albume
              </button>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {selectedAlbum.title}
              </h2>
              <p className="text-lg text-gray-600">{selectedAlbum.description}</p>
            </div>

            {/* Photos grid */}
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {sortedItems.map((item, index) => (
                <GalleryItem key={item.id} item={item} index={index} />
              ))}
            </motion.div>

            {/* Empty state */}
            {sortedItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 py-12"
              >
                Nema fotografija u ovom albumu.
              </motion.div>
            )}
          </>
        ) : (
          // Albums grid view
          <>
            <SectionHeader
              title="Galerija"
              subtitle="Fotografije i video zapisi najvažnijih trenutaka naše klupske priče"
            />

            {/* Albums grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {albums.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedAlbum(album)}
                  className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
                >
                  {/* Cover image */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Photo count badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {album.itemCount}
                      </span>
                    </div>
                  </div>

                  {/* Album info */}
                  <div className="p-5">
                    <h3 className="font-display font-bold text-xl text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                      {album.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {album.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
