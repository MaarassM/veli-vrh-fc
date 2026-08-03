import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../../lib/supabase.js'

const VALID_CATEGORIES = ['seniori', 'juniori', 'pioniri', 'mladi-pioniri', 'u-11', 'u-9', 'veterani']

interface SubscriptionBody {
  endpoint?: string
  keys?: { p256dh?: string; auth?: string }
  categories?: unknown
  notifyResults?: unknown
  notifyReminders?: unknown
}

function sanitizeCategories(input: unknown): string[] {
  if (!Array.isArray(input)) return ['seniori']
  const cleaned = input.filter(
    (c): c is string => typeof c === 'string' && VALID_CATEGORIES.includes(c),
  )
  return cleaned.length > 0 ? cleaned : ['seniori']
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: preferencije postojeće pretplate (za popunjavanje panela)
  if (req.method === 'GET') {
    const endpoint = typeof req.query.endpoint === 'string' ? req.query.endpoint : ''
    if (!endpoint.startsWith('https://')) {
      return res.status(400).json({ error: 'Invalid endpoint' })
    }
    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('categories, notify_results, notify_reminders')
      .eq('endpoint', endpoint)
      .maybeSingle()
    if (error) {
      console.error('[/api/push/subscribe] get error:', error.message)
      return res.status(500).json({ error: 'Failed to load preferences' })
    }
    if (!data) return res.status(404).json({ error: 'Not subscribed' })
    return res.status(200).json({
      categories: data.categories ?? ['seniori'],
      notifyResults: data.notify_results ?? true,
      notifyReminders: data.notify_reminders ?? false,
    })
  }

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
    const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
      {
        endpoint,
        p256dh,
        auth,
        categories: sanitizeCategories(body.categories),
        notify_results: body.notifyResults !== false,
        notify_reminders: body.notifyReminders === true,
      },
      { onConflict: 'endpoint' },
    )
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
