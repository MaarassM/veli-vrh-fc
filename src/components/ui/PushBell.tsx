import { useEffect, useState } from 'react'
import { Bell, BellOff, X, Share, SquarePlus } from 'lucide-react'

type PushState = 'unsupported' | 'off' | 'on' | 'busy' | 'denied' | 'ios-install'

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true
  )
}

// Upute za iOS: push radi tek kad je stranica instalirana na početni zaslon
function IosInstallGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2
            className="text-2xl font-black italic uppercase text-gray-900"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Obavijesti na iPhoneu
          </h2>
          <button onClick={onClose} aria-label="Zatvori" className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Da bi primao obavijesti o rezultatima, prvo dodaj stranicu na početni
          zaslon (radi kao aplikacija):
        </p>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold">1</span>
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              U Safariju dotakni <Share className="h-4 w-4 text-blue-500" /> <strong>Podijeli</strong>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold">2</span>
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              Odaberi <SquarePlus className="h-4 w-4 text-gray-600" /> <strong>Dodaj na početni zaslon</strong>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold">3</span>
            <span>Otvori <strong>NK Veli Vrh</strong> s početnog zaslona i dotakni zvonce 🔔</span>
          </li>
        </ol>
      </div>
    </div>
  )
}

export default function PushBell() {
  const [state, setState] = useState<PushState>('unsupported')
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window
    if (!pushSupported) {
      // iOS Safari izvan instalirane aplikacije nema PushManager —
      // umjesto skrivanja nudimo upute za instalaciju
      if (isIos() && !isStandalone()) setState('ios-install')
      return
    }
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
    state === 'ios-install'
      ? 'Kako uključiti obavijesti na iPhoneu'
      : state === 'denied'
        ? 'Obavijesti su blokirane u postavkama preglednika'
        : active
          ? 'Isključi obavijesti o rezultatima'
          : 'Uključi obavijesti o rezultatima'

  function handleClick() {
    if (state === 'ios-install') {
      setShowGuide(true)
      return
    }
    if (active) disable()
    else enable()
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={state === 'busy' || state === 'denied'}
        title={title}
        aria-label={title}
        className={`fixed bottom-5 right-5 z-40 rounded-full p-3 shadow-lg transition-all cursor-pointer ${
          active
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-white text-gray-500 border border-gray-200 hover:text-orange-500 hover:border-orange-300'
        } ${state === 'busy' ? 'opacity-60' : ''} ${state === 'denied' ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {active ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
      </button>

      {showGuide && <IosInstallGuide onClose={() => setShowGuide(false)} />}
    </>
  )
}
