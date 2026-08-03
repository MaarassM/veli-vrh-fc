// Slanje web push obavijesti — rezultati i podsjetnici, filtrirano po preferencijama
import webpush from 'web-push'
import { supabaseAdmin } from './supabase.js'
import { recipientsFor, type SubscriberPrefs, type NotificationKind } from './push-detect.js'

export interface ResultNotification {
  category: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  matchId: number | null
}

export interface ReminderNotification {
  category: string
  homeTeam: string
  awayTeam: string
  time: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  'seniori': 'Seniori',
  'juniori': 'Juniori',
  'pioniri': 'Pioniri',
  'mladi-pioniri': 'Mlađi pioniri',
  'u-11': 'U-11',
  'u-9': 'U-9',
  'veterani': 'Veterani',
}

interface StoredSub extends SubscriberPrefs {
  p256dh: string
  auth: string
}

function configured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

function setup(): void {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:nkvelivrh@gmail.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )
}

async function fetchSubscribers(): Promise<StoredSub[]> {
  const { data, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, categories, notify_results, notify_reminders')
  if (error || !data) return []
  return data.map(row => ({
    endpoint: row.endpoint,
    p256dh: row.p256dh,
    auth: row.auth,
    categories: row.categories ?? ['seniori'],
    notifyResults: row.notify_results ?? true,
    notifyReminders: row.notify_reminders ?? false,
  }))
}

async function deliver(subs: StoredSub[], payload: string): Promise<number> {
  let sent = 0
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
          await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        } else {
          console.error('[push] send failed:', err instanceof Error ? err.message : err)
        }
      }
    }),
  )
  return sent
}

function titleFor(category: string, kind: NotificationKind): string {
  const label = CATEGORY_LABELS[category] ?? category
  if (kind === 'result') {
    return category === 'seniori' ? 'Kraj utakmice' : `${label} — kraj utakmice`
  }
  return category === 'seniori' ? 'Danas igra Veli Vrh!' : `Danas igraju ${label.toLowerCase()}!`
}

// Protivnik iz perspektive Velog Vrha — poruka je ista doma i u gostima
function opponentOf(homeTeam: string, awayTeam: string): string {
  return /veli vrh/i.test(homeTeam) ? awayTeam : homeTeam
}

export async function sendResultNotifications(results: ResultNotification[]): Promise<number> {
  if (results.length === 0 || !configured()) return 0
  setup()
  const subs = await fetchSubscribers()
  if (subs.length === 0) return 0

  let sent = 0
  for (const result of results) {
    const targets = recipientsFor(subs, result.category, 'result')
    if (targets.length === 0) continue
    const payload = JSON.stringify({
      title: titleFor(result.category, 'result'),
      body: `${result.homeTeam} ${result.homeScore}:${result.awayScore} ${result.awayTeam}`,
      url: result.matchId !== null ? `/utakmice/${result.matchId}` : '/utakmice',
    })
    sent += await deliver(targets, payload)
  }
  return sent
}

export async function sendReminderNotifications(reminders: ReminderNotification[]): Promise<number> {
  if (reminders.length === 0 || !configured()) return 0
  setup()
  const subs = await fetchSubscribers()
  if (subs.length === 0) return 0

  let sent = 0
  for (const reminder of reminders) {
    const targets = recipientsFor(subs, reminder.category, 'reminder')
    if (targets.length === 0) continue
    const timePart = reminder.time ? ` u ${reminder.time}` : ''
    const opponent = opponentOf(reminder.homeTeam, reminder.awayTeam)
    const payload = JSON.stringify({
      title: titleFor(reminder.category, 'reminder'),
      body: `Podrži naše narančaste u utakmici protiv ${opponent}${timePart}.`,
      url: '/utakmice',
    })
    sent += await deliver(targets, payload)
  }
  return sent
}
