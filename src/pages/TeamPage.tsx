import StaffSection from '@/components/team/StaffSection'
import SEO from '@/components/seo/SEO'

export default function TeamPage() {
  return (
    <>
      <SEO
        title="Stručni stožer | NK Veli Vrh Pula"
        description="Upoznajte stručni stožer i igrače NK Veli Vrh iz Pule, Istra."
        canonicalPath="/strucni-stozer"
      />
      <StaffSection />
    </>
  )
}
