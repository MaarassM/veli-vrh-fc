import { useState, useEffect } from 'react'

export interface Scorer {
  personId: number | null
  position: number
  name: string
  club: string
  goals: number
  photoUrl: string | null
}

export function useScorers(limit = 20) {
  const [scorers, setScorers] = useState<Scorer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/scorers?limit=${limit}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(result => setScorers(result.data ?? []))
      .catch(err => setError(err instanceof Error ? err.message : 'Greška pri učitavanju strijelaca'))
      .finally(() => setLoading(false))
  }, [limit])

  return { scorers, loading, error }
}
