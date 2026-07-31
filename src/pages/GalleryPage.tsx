import GalleryGrid from "@/components/gallery/GalleryGrid";
import SEO from "@/components/seo/SEO";

export default function GalleryPage() {
  return (
    <>
      <SEO
        title="Galerija | NK Veli Vrh"
        description="Fotografije s utakmica, treninga i klupskih događaja NK Veli Vrh Pula."
        canonicalPath="/galerija"
      />
      <GalleryGrid />
    </>
  );
}
