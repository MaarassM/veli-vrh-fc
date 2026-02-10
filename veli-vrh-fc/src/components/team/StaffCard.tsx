import { motion } from 'motion/react'
import type { StaffMember } from '@/types'
import { Calendar } from 'lucide-react'

interface StaffCardProps {
  member: StaffMember
  index: number
}

const roleLabels: Record<string, string> = {
  'Head Coach': 'Glavni trener',
  'Assistant Coach': 'Pomoćni trener',
  'Goalkeeping Coach': 'Trener vratara',
  'Fitness Coach': 'Kondicijski trener',
  'Physiotherapist': 'Fizioterapeut',
  'Team Manager': 'Voditelj momčadi',
}

export default function StaffCard({ member, index }: StaffCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={member.image}
          alt={`${member.firstName} ${member.lastName}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <div className="text-white">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>U klubu od {member.since}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-gray-900 mb-1">
          {member.firstName} {member.lastName}
        </h3>
        <p className="text-orange-500 font-medium">
          {roleLabels[member.role]}
        </p>
      </div>
    </motion.div>
  )
}
