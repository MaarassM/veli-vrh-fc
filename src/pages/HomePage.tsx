import HeroSection from "@/components/home/HeroSection";
import NextMatchBanner from "@/components/home/NextMatchBanner";
import IntroSection from "@/components/home/IntroSection";
import LeagueTable from "@/components/home/LeagueTable";
import ClubValues from "@/components/home/ClubValues";
import NewsSection from "@/components/home/NewsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <NextMatchBanner />
      <IntroSection />
      <LeagueTable />
      <ClubValues />
      <NewsSection />
    </>
  );
}
