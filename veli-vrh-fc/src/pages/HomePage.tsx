import HeroSection from '@/components/home/HeroSection'
import IntroSection from '@/components/home/IntroSection'
import LeagueTable from '@/components/home/LeagueTable'
import TopScorers from '@/components/home/TopScorers'
import HighlightsGrid from '@/components/home/HighlightsGrid'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntroSection />
      <LeagueTable />
      <TopScorers />
      <HighlightsGrid />
    </>
  )
}
