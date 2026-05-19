import ClubOverview from '@/components/about/ClubOverview'
import HistoryTimeline from '@/components/about/HistoryTimeline'
import StadiumInfo from '@/components/about/StadiumInfo'
import SEO from '@/components/seo/SEO'

export default function AboutPage() {
  return (
    <>
      <SEO
        title="O klubu | NK Veli Vrh — Povijest od 1975."
        description="Saznajte više o NK Veli Vrh, nogometnom klubu osnovanom 1975. godine u Puli, Istra. Povijest, tradicija i zajedništvo."
        canonicalPath="/o-klubu"
      />
      <ClubOverview />
      <HistoryTimeline />
      <StadiumInfo />
    </>
  )
}
