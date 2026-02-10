import { useState } from 'react'
import { motion } from 'motion/react'
import GalleryItem from './GalleryItem'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import { galleryItems } from '@/data/gallery'

const allTags = Array.from(
  new Set(galleryItems.flatMap((item) => item.tags))
).sort()

export default function GalleryGrid() {
  const [activeTag, setActiveTag] = useState<string | 'all'>('all')

  const filteredItems =
    activeTag === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.tags.includes(activeTag))

  // Sort by date descending
  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Galerija"
          subtitle="Fotografije i video zapisi najvažnijih trenutaka naše klupske priče"
        />

        {/* Tag filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          <Button
            variant={activeTag === 'all' ? 'primary' : 'secondary'}
            onClick={() => setActiveTag('all')}
          >
            Sve
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? 'primary' : 'secondary'}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </motion.div>

        {/* Gallery grid */}
        <motion.div
          layout
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
            className="mt-12 text-center text-gray-500"
          >
            Nema medija s ovom oznakom.
          </motion.div>
        )}

        {/* Item count */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            Prikazano <strong className="text-orange-500">{sortedItems.length}</strong>{' '}
            {activeTag === 'all' ? 'svih' : 'filtriranih'} fotografija
          </p>
        </motion.div>
      </div>
    </section>
  )
}
