import { Bell, Share, SquarePlus, EllipsisVertical, Monitor, Smartphone, Settings } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import SEO from '@/components/seo/SEO'

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold mt-0.5">
        {n}
      </span>
      <span className="text-sm text-gray-700 leading-relaxed">{children}</span>
    </li>
  )
}

function PlatformCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Smartphone
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2
            className="text-xl font-black italic uppercase text-gray-900 leading-tight"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            {title}
          </h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default function ObavijestiPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO
        title="Obavijesti i aplikacija | NK Veli Vrh"
        description="Kako dodati NK Veli Vrh na početni zaslon i uključiti obavijesti o rezultatima na iPhoneu, Androidu i računalu."
        canonicalPath="/obavijesti"
      />
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Obavijesti i aplikacija"
          subtitle="Dodaj stranicu na početni zaslon i primaj rezultate čim utakmica završi — besplatno, bez instalacije iz trgovine."
        />

        {/* Što dobivaš */}
        <div className="bg-gray-900 text-white rounded-2xl p-6 mb-8 flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500">
            <Bell className="h-5 w-5" />
          </span>
          <div className="text-sm leading-relaxed text-gray-300">
            Preko <strong className="text-white">zvonca u donjem desnom kutu</strong> biraš
            koje kategorije pratiš (seniori, juniori, pioniri…) i što želiš primati:{' '}
            <strong className="text-white">rezultat na kraju utakmice</strong> i/ili{' '}
            <strong className="text-white">podsjetnik na dan utakmice</strong>.
          </div>
        </div>

        <div className="space-y-6">
          {/* iPhone */}
          <PlatformCard icon={Smartphone} title="iPhone i iPad" subtitle="Safari — obavijesti rade tek nakon dodavanja na početni zaslon">
            <ol className="space-y-3">
              <Step n={1}>
                Otvori stranicu u <strong>Safariju</strong> i dotakni{' '}
                <Share className="inline h-4 w-4 text-blue-500 align-text-bottom" /> <strong>Podijeli</strong>
              </Step>
              <Step n={2}>
                Odaberi <SquarePlus className="inline h-4 w-4 text-gray-600 align-text-bottom" />{' '}
                <strong>Dodaj na početni zaslon</strong> pa <strong>Dodaj</strong>
              </Step>
              <Step n={3}>
                Otvori <strong>NK Veli Vrh</strong> s početnog zaslona (ikona kluba) i dotakni{' '}
                <Bell className="inline h-4 w-4 text-orange-500 align-text-bottom" /> zvonce — dopusti obavijesti
              </Step>
            </ol>
            <p className="mt-4 flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
              <Settings className="h-4 w-4 shrink-0 mt-0.5" />
              Ako obavijesti ne stižu: iPhone <strong>Postavke → Obavijesti → NK Veli Vrh</strong> →
              uključi "Dopusti obavijesti". Potreban je iOS 16.4 ili noviji.
            </p>
          </PlatformCard>

          {/* Android */}
          <PlatformCard icon={Smartphone} title="Android (Samsung, Xiaomi…)" subtitle="Chrome ili Samsung Internet — radi i bez instalacije">
            <ol className="space-y-3">
              <Step n={1}>
                Dotakni <Bell className="inline h-4 w-4 text-orange-500 align-text-bottom" /> zvonce u donjem
                desnom kutu i dopusti obavijesti kad preglednik pita — to je sve!
              </Step>
              <Step n={2}>
                Za ikonu na početnom zaslonu (preporuka): u Chromeu dotakni{' '}
                <EllipsisVertical className="inline h-4 w-4 text-gray-600 align-text-bottom" /> izbornik →{' '}
                <strong>Dodaj na početni zaslon</strong> / <strong>Instaliraj aplikaciju</strong>
              </Step>
            </ol>
            <p className="mt-4 flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
              <Settings className="h-4 w-4 shrink-0 mt-0.5" />
              Ako si ranije odbio obavijesti: dotakni ikonu pored adrese stranice →{' '}
              <strong>Dopuštenja → Obavijesti → Dopusti</strong>. Na Samsungu provjeri i{' '}
              <strong>Postavke → Obavijesti</strong> da preglednik smije slati obavijesti.
            </p>
          </PlatformCard>

          {/* Desktop */}
          <PlatformCard icon={Monitor} title="Računalo" subtitle="Chrome, Edge, Firefox">
            <ol className="space-y-3">
              <Step n={1}>
                Klikni <Bell className="inline h-4 w-4 text-orange-500 align-text-bottom" /> zvonce u donjem
                desnom kutu, odaberi kategorije i klikni <strong>Uključi obavijesti</strong>
              </Step>
              <Step n={2}>Dopusti obavijesti u dijalogu preglednika — gotovo</Step>
            </ol>
          </PlatformCard>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Obavijesti se šalju automatski iz HNS Semafor podataka. Odjava bilo kad — zvonce → Isključi.
        </p>
      </div>
    </div>
  )
}
