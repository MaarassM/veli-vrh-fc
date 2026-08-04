import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await supabase.from('competitions').select('season')

  if (error) {
    console.error('[/api/seasons] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch seasons' })
  }

  const seasons = [...new Set((data ?? []).map(row => row.season as string))].sort().reverse()

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).json({ data: seasons, fetchedAt: new Date().toISOString() })
}
