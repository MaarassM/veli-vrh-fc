import type { VercelRequest, VercelResponse } from '@vercel/node'
import webpush from 'web-push'
import { supabaseAdmin } from '../../lib/supabase.js'

// Prava probna obavijest kroz push kanal — potvrda korisniku da sve radi
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
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
    console.error('[/api/push/welcome] send failed:', err instanceof Error ? err.message : err)
    return res.status(502).json({ error: 'Failed to send test notification' })
  }
}
