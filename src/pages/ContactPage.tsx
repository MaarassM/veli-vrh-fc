import ContactDetails from '@/components/contact/ContactDetails'
import SocialLinks from '@/components/contact/SocialLinks'
import MapPlaceholder from '@/components/contact/MapPlaceholder'
import SEO from '@/components/seo/SEO'
import { seoProps } from '@/lib/seo-routes'

export default function ContactPage() {
  return (
    <>
      <SEO {...seoProps('/kontakt')} />
      <ContactDetails />
      <SocialLinks />
      <MapPlaceholder />
    </>
  )
}
