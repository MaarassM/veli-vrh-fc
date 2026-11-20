import { useMemo } from 'react'
import { useTeamPlayers } from '@/hooks/useTeamPlayers'
import { groupPlayers } from '@/lib/players'
import PageHeader from '@/components/ui/PageHeader'
import PlayerCard from '@/components/team/PlayerCard'
import StaffSection from '@/components/team/StaffSection'
import SEO from '@/components/seo/SEO'
import { seoProps } from '@/lib/seo-routes'

export default function MomcadPage() {
  const { players, loading } = useTeamPlayers()
  const groups = useMemo(() => groupPlayers(players), [players])

  return (
    <>
      <SEO {...seoProps('/momcad')} />
      <div className="bg-gray-50 py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <PageHeader title="Momčad" subtitle="Seniori — NK Veli Vrh" />

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl aspect-[4/5] border border-gray-100" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Popis igrača uskoro.</p>
          ) : (
            <div className="space-y-12">
              {groups.map(group => (
                <section key={group.title}>
                  <h2 className="heading-club text-2xl text-gray-900 mb-4">{group.title}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {group.players.map(p => (
                      <PlayerCard key={p.id} player={p} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
      <StaffSection />
    </>
  )
}
