// Edge funkcija: auto-generirana grafika rezultata (1200×630) za dijeljenje
import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

interface MatchDetailRow {
  match_id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  kickoff_at: string | null
  venue: string | null
}

async function fetchMatch(id: string): Promise<MatchDetailRow | null> {
  const base = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!base || !key) return null
  const res = await fetch(
    `${base}/rest/v1/match_details?match_id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  )
  if (!res.ok) return null
  const rows = (await res.json()) as MatchDetailRow[]
  return rows[0] ?? null
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') ?? ''

  if (!/^\d+$/.test(id)) {
    return new Response('Missing or invalid id', { status: 400 })
  }

  const match = await fetchMatch(id)
  if (!match) {
    return new Response('Match not found', { status: 404 })
  }

  const played = match.home_score !== null && match.away_score !== null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#f97316',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: 'uppercase',
            marginBottom: 40,
          }}
        >
          NK Veli Vrh · Rezultat
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 50,
            width: '100%',
            padding: '0 60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'flex-end',
              fontSize: 52,
              fontWeight: 800,
              textAlign: 'right',
            }}
          >
            {match.home_team}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f97316',
              borderRadius: 24,
              padding: '20px 40px',
              fontSize: 88,
              fontWeight: 900,
            }}
          >
            {played ? `${match.home_score}:${match.away_score}` : 'VS'}
          </div>

          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'flex-start',
              fontSize: 52,
              fontWeight: 800,
              textAlign: 'left',
            }}
          >
            {match.away_team}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 30,
            marginTop: 50,
            fontSize: 26,
            color: '#9ca3af',
          }}
        >
          <span>{formatDate(match.kickoff_at)}</span>
          {match.venue ? <span>· {match.venue}</span> : null}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}
