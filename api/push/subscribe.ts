import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../../lib/supabase.js'

interface SubscriptionBody {
  endpoint?: string
  keys?: { p256dh?: string; auth?: string }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = (req.body ?? {}) as SubscriptionBody
  const endpoint = typeof body.endpoint === 'string' ? body.endpoint : ''

  if (!endpoint.startsWith('https://')) {
    return res.status(400).json({ error: 'Invalid subscription' })
  }

  if (req.method === 'POST') {
    const p256dh = body.keys?.p256dh
    const auth = body.keys?.auth
    if (!p256dh || !auth) {
      return res.status(400).json({ error: 'Invalid subscription keys' })
    }
    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert({ endpoint, p256dh, auth }, { onConflict: 'endpoint' })
    if (error) {
      console.error('[/api/push/subscribe] upsert error:', error.message)
      return res.status(500).json({ error: 'Failed to save subscription' })
    }
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
    if (error) {
      console.error('[/api/push/subscribe] delete error:', error.message)
      return res.status(500).json({ error: 'Failed to remove subscription' })
    }
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
