import GalleryGrid from "@/components/gallery/GalleryGrid";
import SEO from "@/components/seo/SEO";
import { seoProps } from "@/lib/seo-routes";

export default function GalleryPage() {
  return (
    <>
      <SEO {...seoProps('/galerija')} />
      <GalleryGrid />
    </>
  );
}
