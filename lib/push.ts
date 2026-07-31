// Slanje web push obavijesti o rezultatima
import webpush from 'web-push'
import { supabaseAdmin } from './supabase.js'

export interface ResultNotification {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  matchId: number | null
}

function configured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

export async function sendResultNotifications(results: ResultNotification[]): Promise<number> {
  if (results.length === 0 || !configured()) return 0

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:nkvelivrh@gmail.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )

  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')

  if (error || !subs || subs.length === 0) return 0

  let sent = 0
  for (const result of results) {
    const payload = JSON.stringify({
      title: 'Kraj utakmice',
      body: `${result.homeTeam} ${result.homeScore}:${result.awayScore} ${result.awayTeam}`,
      url: result.matchId !== null ? `/utakmice/${result.matchId}` : '/utakmice',
    })

    await Promise.all(
      subs.map(async sub => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          )
          sent++
        } catch (err: unknown) {
          const statusCode = (err as { statusCode?: number }).statusCode
          if (statusCode === 404 || statusCode === 410) {
            // Mrtva pretplata — počisti
            await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          } else {
            console.error('[push] send failed:', err instanceof Error ? err.message : err)
          }
        }
      }),
    )
  }
  return sent
}
