import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../../lib/supabase.js'

const GRAPH_API_VERSION = 'v19.0'

interface FacebookPost {
  id: string
  message?: string
  full_picture?: string
  created_time: string
  permalink_url: string
}

interface FacebookResponse {
  data: FacebookPost[]
  paging?: {
    cursors: { before: string; after: string }
    next?: string
  }
}

async function fetchFacebookPosts(): Promise<FacebookPost[]> {
  const pageId = process.env.FACEBOOK_PAGE_ID
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN

  if (!pageId || !accessToken) {
    throw new Error('FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN not set')
  }

  const fields = 'id,message,full_picture,created_time,permalink_url'
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/posts?fields=${fields}&limit=20&access_token=${accessToken}`

  const response = await fetch(url)

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Facebook API error ${response.status}: ${body}`)
  }

  const result: FacebookResponse = await response.json()

  // Only keep posts that have a photo
  return result.data.filter((p) => Boolean(p.full_picture))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startTime = Date.now()
  console.log('[sync-news] Starting Facebook sync...')

  try {
    const posts = await fetchFacebookPosts()
    console.log(`[sync-news] Fetched ${posts.length} photo posts from Facebook`)

    if (posts.length === 0) {
      return res.status(200).json({ success: true, count: 0, duration_ms: Date.now() - startTime })
    }

    const rows = posts.map((p) => ({
      id: p.id,
      message: p.message ?? null,
      full_picture: p.full_picture!,
      created_time: p.created_time,
      permalink_url: p.permalink_url,
      synced_at: new Date().toISOString(),
    }))

    const { error } = await supabaseAdmin
      .from('news_posts')
      .upsert(rows, { onConflict: 'id' })

    if (error) throw new Error(`Supabase upsert error: ${error.message}`)

    const duration = Date.now() - startTime
    console.log(`[sync-news] Done in ${duration}ms — upserted ${rows.length} posts`)

    return res.status(200).json({
      success: true,
      count: rows.length,
      duration_ms: duration,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[sync-news] Error:', message)
    return res.status(500).json({ success: false, error: message })
  }
}
