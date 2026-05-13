import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const limit = Math.min(Number(req.query.limit) || 6, 20)

  const { data, error } = await supabase
    .from('news_posts')
    .select('id, message, full_picture, created_time, permalink_url')
    .order('created_time', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[/api/news] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch news' })
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

  return res.status(200).json({
    data: data ?? [],
    fetchedAt: new Date().toISOString(),
  })
}
