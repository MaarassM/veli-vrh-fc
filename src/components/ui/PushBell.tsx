import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

type PushState = 'unsupported' | 'off' | 'on' | 'busy' | 'denied'

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

export default function PushBell() {
  const [state, setState] = useState<PushState>('unsupported')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setState(sub ? 'on' : 'off'))
      .catch(() => setState('unsupported'))
  }, [])

  async function enable() {
    setState('busy')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off')
        return
      }
      const keyRes = await fetch('/api/push/key')
      if (!keyRes.ok) throw new Error('push not configured')
      const { key } = await keyRes.json()

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
      const save = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      if (!save.ok) throw new Error('save failed')
      setState('on')
    } catch (err) {
      console.error('[push] enable failed:', err)
      setState('off')
    }
  }

  async function disable() {
    setState('busy')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setState('off')
    } catch {
      setState('on')
    }
  }

  if (state === 'unsupported') return null

  const active = state === 'on'
  const title =
    state === 'denied'
      ? 'Obavijesti su blokirane u postavkama preglednika'
      : active
        ? 'Isključi obavijesti o rezultatima'
        : 'Uključi obavijesti o rezultatima'

  return (
    <button
      onClick={active ? disable : enable}
      disabled={state === 'busy' || state === 'denied'}
      title={title}
      aria-label={title}
      className={`fixed bottom-5 right-5 z-40 rounded-full p-3 shadow-lg transition-all ${
        active
          ? 'bg-orange-500 text-white hover:bg-orange-600'
          : 'bg-white text-gray-500 border border-gray-200 hover:text-orange-500 hover:border-orange-300'
      } ${state === 'busy' ? 'opacity-60' : ''} ${state === 'denied' ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {active ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
    </button>
  )
}
