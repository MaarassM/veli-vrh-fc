import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toPlayer, type PlayerRow } from '@/lib/players'
import type { Player } from '@/types'

export function useTeamPlayers(): { players: Player[]; loading: boolean } {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('team_players')
      .select('id, first_name, last_name, number, position')
      .then(({ data, error }) => {
        if (!error && data) setPlayers((data as PlayerRow[]).map(toPlayer))
        setLoading(false)
      })
  }, [])

  return { players, loading }
}
