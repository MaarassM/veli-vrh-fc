import HeroSection from "@/components/home/HeroSection";
import NextMatchBanner from "@/components/home/NextMatchBanner";
import IntroSection from "@/components/home/IntroSection";
import LeagueTable from "@/components/home/LeagueTable";
import ClubValues from "@/components/home/ClubValues";
import SponsorsStrip from "@/components/home/SponsorsStrip";
import TopScorersHome from "@/components/home/TopScorersHome";
import SEO from "@/components/seo/SEO";
import { seoProps } from "@/lib/seo-routes";

export default function HomePage() {
  return (
    <>
      <SEO {...seoProps('/')} />
      <HeroSection />
      <NextMatchBanner />
      <IntroSection />
      <LeagueTable />
      <TopScorersHome />
      <ClubValues />
      <SponsorsStrip />
    </>
  );
}
