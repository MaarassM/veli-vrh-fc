import ContactDetails from '@/components/contact/ContactDetails'
import SocialLinks from '@/components/contact/SocialLinks'
import MapPlaceholder from '@/components/contact/MapPlaceholder'
import SEO from '@/components/seo/SEO'

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Kontakt | NK Veli Vrh Pula"
        description="Kontaktirajte NK Veli Vrh. Adresa: Veli Vrh 1, 52100 Pula. Email: nkvelivrh@gmail.com. Pratite nas na Facebooku i Instagramu."
        canonicalPath="/kontakt"
      />
      <ContactDetails />
      <SocialLinks />
      <MapPlaceholder />
    </>
  )
}
