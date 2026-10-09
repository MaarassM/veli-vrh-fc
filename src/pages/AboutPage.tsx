import ClubOverview from '@/components/about/ClubOverview'
import HistoryTimeline from '@/components/about/HistoryTimeline'
import StadiumInfo from '@/components/about/StadiumInfo'
import SEO from '@/components/seo/SEO'
import { seoProps } from '@/lib/seo-routes'

export default function AboutPage() {
  return (
    <>
      <SEO {...seoProps('/o-klubu')} />
      <ClubOverview />
      <HistoryTimeline />
      <StadiumInfo />
    </>
  )
}
