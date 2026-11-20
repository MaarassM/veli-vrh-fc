import HeroSection from "@/components/home/HeroSection";
import IntroSection from "@/components/home/IntroSection";
import ClubValues from "@/components/home/ClubValues";
import SEO from "@/components/seo/SEO";
import { seoProps } from "@/lib/seo-routes";

export default function HomePage() {
  return (
    <>
      <SEO {...seoProps('/')} />
      <HeroSection />
      <IntroSection />
      <ClubValues />
    </>
  );
}
