import HeroSection from "@/components/home/HeroSection";
import IntroSection from "@/components/home/IntroSection";
import LeagueTable from "@/components/home/LeagueTable";
import ClubValues from "@/components/home/ClubValues";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntroSection />
      <LeagueTable />
      <ClubValues />
    </>
  );
}
