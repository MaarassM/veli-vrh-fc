import PageHeader from '@/components/ui/PageHeader'
import SEO from '@/components/seo/SEO'
import { seoProps } from '@/lib/seo-routes'
import { contactInfo } from '@/data/contact'

// TODO-korisnik: prije objave neka netko iz uprave potvrdi podatke udruge
// (OIB, adresa, osoba za kontakt) i praksu oko fotografiranja mlađih uzrasta.
const CLUB_OIB = '93093916559'
const UPDATED = '1. listopada 2026.'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="heading-club text-2xl text-gray-900 mb-3">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivatnostPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO {...seoProps('/privatnost')} />
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Privatnost i uvjeti"
          subtitle={`Zadnja izmjena: ${UPDATED}`}
        />

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <Section title="Tko smo">
            <p>
              Ovu stranicu vodi <strong>Nogometni klub „Veli Vrh" Pula</strong>, udruga sa
              sjedištem na adresi {contactInfo.address.street}, {contactInfo.address.postalCode}{' '}
              {contactInfo.address.city}, OIB {CLUB_OIB}. Za sva pitanja o osobnim podacima
              pišite na{' '}
              <a href={`mailto:${contactInfo.email}`} className="text-orange-500 hover:text-orange-600">
                {contactInfo.email}
              </a>
              .
            </p>
          </Section>

          <Section title="Koje podatke prikupljamo">
            <p>
              <strong>Rezultati i podaci o igračima</strong> preuzimaju se automatski s HNS
              Semafora, službenog sustava Hrvatskog nogometnog saveza. To su javno objavljeni
              natjecateljski podaci: ime i prezime, broj dresa, nastupi, golovi i kartoni.
            </p>
            <p>
              <strong>Fotografije</strong> s utakmica, treninga i klupskih događanja objavljujemo
              u galeriji. Fotografije objavljujemo isključivo uz dopuštenje, a za maloljetne
              članove uz suglasnost roditelja ili skrbnika.
            </p>
            <p>
              <strong>Ne prikupljamo</strong> podatke posjetitelja: stranica nema obrazaca za
              prijavu, newsletter ni korisničke račune. Ako nam pišete e-poštom, vašu poruku
              koristimo samo da vam odgovorimo.
            </p>
          </Section>

          <Section title="Kolačići">
            <p>
              Koristimo samo tehnički nužnu pohranu u vašem pregledniku — pamtimo da ste zatvorili
              obavijest o kolačićima. Nemamo alate za praćenje posjetitelja niti oglašivačke
              kolačiće, pa vaše ponašanje na stranici nitko ne prati ni ne profilira.
            </p>
          </Section>

          <Section title="Vaša prava">
            <p>
              Prema Općoj uredbi o zaštiti podataka (GDPR) imate pravo zatražiti uvid u svoje
              podatke, njihov ispravak ili brisanje te uložiti prigovor na obradu.
            </p>
            <p>
              <strong>Ako želite da uklonimo fotografiju</strong> na kojoj ste vi ili vaše dijete,
              javite nam se e-poštom i uklonit ćemo je bez objašnjenja i bez odgode.
            </p>
            <p>
              Pritužbu možete uputiti i Agenciji za zaštitu osobnih podataka (AZOP), Selska cesta
              136, 10000 Zagreb.
            </p>
          </Section>

          <Section title="Točnost rezultata">
            <p>
              Rezultati, ljestvice i statistike dolaze s HNS Semafora i osvježavaju se više puta
              dnevno. Službeni su podaci oni koje objavljuje Hrvatski nogometni savez — ako
              uočite nesklad, mjerodavan je Semafor.
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
