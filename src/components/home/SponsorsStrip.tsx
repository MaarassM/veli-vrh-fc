import { sponsors } from '@/data/sponsors'

export default function SponsorsStrip() {
  if (sponsors.length === 0) return null

  return (
    <section className="bg-gray-100 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
          Klub podržavaju
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {sponsors.map(sponsor => {
            const logo = sponsor.logoUrl ? (
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name}
                className="h-12 w-auto object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all"
                loading="lazy"
              />
            ) : (
              <span className="text-gray-500 font-semibold">{sponsor.name}</span>
            )
            return sponsor.url ? (
              <a key={sponsor.name} href={sponsor.url} target="_blank" rel="noopener noreferrer">
                {logo}
              </a>
            ) : (
              <span key={sponsor.name}>{logo}</span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
