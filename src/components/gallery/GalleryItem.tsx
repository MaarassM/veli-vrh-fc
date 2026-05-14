import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { GalleryItem as GalleryItemType } from '@/types'
import { Calendar, X, Play } from 'lucide-react'

interface GalleryItemProps {
  item: GalleryItemType
  index: number
}

export default function GalleryItem({ item, index }: GalleryItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Gallery item card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen(true)}
        className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
      >
        {/* Image */}
        <img
          src={item.src}
          alt={item.caption}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Video indicator */}
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-sm p-4 rounded-full">
              <Play className="w-8 h-8 text-white" fill="white" />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="font-medium mb-1 line-clamp-2">{item.caption}</p>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Calendar className="w-4 h-4" />
              <span>{new Date(item.date).toLocaleDateString('hr-HR')}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Modal/Lightbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Close button */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Image/Video container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full"
            >
              <img
                src={item.src}
                alt={item.caption}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-center text-white">
                <p className="text-lg font-medium mb-2">{item.caption}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-white/70">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(item.date).toLocaleDateString('hr-HR')}</span>
                </div>
                <div className="flex justify-center gap-2 mt-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/10 text-white text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
