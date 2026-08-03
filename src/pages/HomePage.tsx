import HeroSection from "@/components/home/HeroSection";
import NextMatchBanner from "@/components/home/NextMatchBanner";
import IntroSection from "@/components/home/IntroSection";
import LeagueTable from "@/components/home/LeagueTable";
import ClubValues from "@/components/home/ClubValues";
import NewsSection from "@/components/home/NewsSection";
import SponsorsStrip from "@/components/home/SponsorsStrip";
import TopScorersHome from "@/components/home/TopScorersHome";
import SEO from "@/components/seo/SEO";

export default function HomePage() {
  return (
    <>
      <SEO
        title="NK Veli Vrh | Nogometni klub iz Pule, Istra"
        description="NK Veli Vrh je hrvatska nogometna udruga iz Pule, Istra. Pratite rezultate, vijesti i raspored utakmica."
        canonicalPath="/"
      />
      <HeroSection />
      <NextMatchBanner />
      <IntroSection />
      <LeagueTable />
      <TopScorersHome />
      <ClubValues />
      <NewsSection />
      <SponsorsStrip />
    </>
  );
}
