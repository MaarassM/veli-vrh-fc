import SectionHeader from '@/components/ui/SectionHeader'
import StaffCard from './StaffCard'
import { staffMembers } from '@/data/staff'

export default function StaffSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Stručni stožer"
          subtitle="Tim profesionalaca koji vode naš klub prema uspjehu"
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {staffMembers.map((member, index) => (
            <StaffCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
