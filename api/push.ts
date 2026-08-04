// Svi push endpointi u jednoj funkciji (Vercel Hobby limit: 12 funkcija)
// GET  ?action=key                → VAPID javni ključ
// GET  ?action=prefs&endpoint=…   → preferencije pretplate
// POST ?action=subscribe          → upsert pretplate s preferencijama
// DELETE ?action=subscribe        → brisanje pretplate
// POST ?action=welcome            → probna obavijest kroz pravi push kanal
import type { VercelRequest, VercelResponse } from '@vercel/node'
import webpush from 'web-push'
import { supabaseAdmin } from '../lib/supabase.js'

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

async function handleKey(res: VercelResponse) {
  const key = process.env.VAPID_PUBLIC_KEY
  if (!key) return res.status(503).json({ error: 'Push not configured' })
  res.setHeader('Cache-Control', 's-maxage=86400')
  return res.status(200).json({ key })
}

async function handlePrefs(req: VercelRequest, res: VercelResponse) {
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
    console.error('[/api/push prefs] error:', error.message)
    return res.status(500).json({ error: 'Failed to load preferences' })
  }
  if (!data) return res.status(404).json({ error: 'Not subscribed' })
  return res.status(200).json({
    categories: data.categories ?? ['seniori'],
    notifyResults: data.notify_results ?? true,
    notifyReminders: data.notify_reminders ?? false,
  })
}

async function handleSubscribe(req: VercelRequest, res: VercelResponse) {
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
      console.error('[/api/push subscribe] upsert error:', error.message)
      return res.status(500).json({ error: 'Failed to save subscription' })
    }
    return res.status(200).json({ ok: true })
  }

  // DELETE
  const { error } = await supabaseAdmin
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
  if (error) {
    console.error('[/api/push subscribe] delete error:', error.message)
    return res.status(500).json({ error: 'Failed to remove subscription' })
  }
  return res.status(200).json({ ok: true })
}

async function handleWelcome(req: VercelRequest, res: VercelResponse) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(503).json({ error: 'Push not configured' })
  }
  const endpoint = typeof (req.body ?? {}).endpoint === 'string' ? req.body.endpoint : ''
  if (!endpoint.startsWith('https://')) {
    return res.status(400).json({ error: 'Invalid endpoint' })
  }

  const { data: sub, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('endpoint', endpoint)
    .maybeSingle()

  if (error || !sub) {
    return res.status(404).json({ error: 'Subscription not found' })
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:nkvelivrh@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )

  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify({
        title: 'Obavijesti su uključene!',
        body: 'Ovako će ti stizati obavijesti o utakmicama NK Veli Vrh. Idemo, narančasti!',
        url: '/utakmice',
      }),
    )
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[/api/push welcome] send failed:', err instanceof Error ? err.message : err)
    return res.status(502).json({ error: 'Failed to send test notification' })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = typeof req.query.action === 'string' ? req.query.action : ''

  if (action === 'key' && req.method === 'GET') return handleKey(res)
  if (action === 'prefs' && req.method === 'GET') return handlePrefs(req, res)
  if (action === 'subscribe' && (req.method === 'POST' || req.method === 'DELETE'))
    return handleSubscribe(req, res)
  if (action === 'welcome' && req.method === 'POST') return handleWelcome(req, res)

  return res.status(405).json({ error: 'Unknown action or method' })
}
