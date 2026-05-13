import HeroSection from "@/components/home/HeroSection";
import IntroSection from "@/components/home/IntroSection";
import LeagueTable from "@/components/home/LeagueTable";
import ClubValues from "@/components/home/ClubValues";
import NewsSection from "@/components/home/NewsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntroSection />
      <LeagueTable />
      <ClubValues />
      <NewsSection />
    </>
  );
}
