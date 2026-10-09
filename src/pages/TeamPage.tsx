import StaffSection from '@/components/team/StaffSection'
import SEO from '@/components/seo/SEO'
import { seoProps } from '@/lib/seo-routes'

export default function TeamPage() {
  return (
    <>
      <SEO {...seoProps('/strucni-stozer')} />
      <StaffSection />
    </>
  )
}
