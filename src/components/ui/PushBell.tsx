import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Bell, BellOff, X, Share, SquarePlus, Loader2 } from 'lucide-react'

type BellMode = 'hidden' | 'ready' | 'denied' | 'ios-install'

interface Prefs {
  categories: string[]
  notifyResults: boolean
  notifyReminders: boolean
}

const DEFAULT_PREFS: Prefs = { categories: ['seniori'], notifyResults: true, notifyReminders: true }
const PREFS_KEY = 'push-prefs'

const CATEGORIES = [
  { key: 'seniori', label: 'Seniori' },
  { key: 'juniori', label: 'Juniori' },
  { key: 'pioniri', label: 'Pioniri' },
  { key: 'mladi-pioniri', label: 'Mlađi pioniri' },
  { key: 'u-11', label: 'U-11' },
  { key: 'u-9', label: 'U-9' },
  { key: 'veterani', label: 'Veterani' },
]

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

function loadLocalPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return DEFAULT_PREFS
}

// Upute za iOS: push radi tek kad je stranica instalirana na početni zaslon
function IosInstallGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
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
          Da bi primao obavijesti o rezultatima, prvo dodaj stranicu na početni zaslon (radi kao aplikacija):
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
            <span>Otvori <strong>NK Veli Vrh</strong> s početnog zaslona i dotakni zvonce</span>
          </li>
        </ol>
        <Link
          to="/obavijesti"
          onClick={onClose}
          className="mt-4 inline-block text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          Detaljne upute →
        </Link>
      </div>
    </div>
  )
}

interface PanelProps {
  subscribed: boolean
  prefs: Prefs
  busy: boolean
  onSave: (prefs: Prefs) => void
  onDisable: () => void
  onClose: () => void
}

function SettingsPanel({ subscribed, prefs, busy, onSave, onDisable, onClose }: PanelProps) {
  const [draft, setDraft] = useState<Prefs>(prefs)

  function toggleCategory(key: string) {
    setDraft(d => {
      const has = d.categories.includes(key)
      const categories = has ? d.categories.filter(c => c !== key) : [...d.categories, key]
      return { ...d, categories }
    })
  }

  const canSave = draft.categories.length > 0 && (draft.notifyResults || draft.notifyReminders)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-1">
          <h2
            className="text-2xl font-black italic uppercase text-gray-900"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Obavijesti
          </h2>
          <button onClick={onClose} aria-label="Zatvori" className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Odaberi što želiš primati na svoj uređaj.</p>

        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Kategorije</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CATEGORIES.map(cat => {
            const active = draft.categories.includes(cat.key)
            return (
              <button
                key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Vrste obavijesti</p>
        <div className="space-y-2 mb-5">
          <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.notifyResults}
              onChange={e => setDraft(d => ({ ...d, notifyResults: e.target.checked }))}
              className="accent-orange-500 h-4 w-4"
            />
            Rezultati (kraj utakmice)
          </label>
          <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.notifyReminders}
              onChange={e => setDraft(d => ({ ...d, notifyReminders: e.target.checked }))}
              className="accent-orange-500 h-4 w-4"
            />
            Podsjetnik na dan utakmice
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSave(draft)}
            disabled={busy || !canSave}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {subscribed ? 'Spremi promjene' : 'Uključi obavijesti'}
          </button>
          {subscribed && (
            <button
              onClick={onDisable}
              disabled={busy}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
            >
              Isključi
            </button>
          )}
        </div>
        {!canSave && (
          <p className="mt-2 text-xs text-red-500">Odaberi barem jednu kategoriju i vrstu obavijesti.</p>
        )}
        <Link
          to="/obavijesti"
          onClick={onClose}
          className="mt-3 inline-block text-xs text-gray-400 hover:text-orange-500 transition-colors"
        >
          Kako rade obavijesti i instalacija na mobitel? →
        </Link>
      </div>
    </div>
  )
}

export default function PushBell() {
  const [mode, setMode] = useState<BellMode>('hidden')
  const [subscribed, setSubscribed] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<false | 'settings' | 'ios'>(false)

  useEffect(() => {
    const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window
    if (!pushSupported) {
      if (isIos() && !isStandalone()) setMode('ios-install')
      return
    }
    if (Notification.permission === 'denied') {
      setMode('denied')
      return
    }
    setPrefs(loadLocalPrefs())
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => reg.pushManager.getSubscription())
      .then(async sub => {
        setMode('ready')
        if (!sub) return
        setSubscribed(true)
        // Preferencije sa servera su istina — localStorage je samo cache
        try {
          const res = await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`)
          if (res.ok) {
            const server = await res.json()
            setPrefs({ ...DEFAULT_PREFS, ...server })
          }
        } catch {
          /* zadrži lokalne */
        }
      })
      .catch(() => setMode('hidden'))
  }, [])

  // Hero gumb "Prati rezultate" otvara panel odavde (custom event);
  // ako smo skriveni/blokirani, event ostaje neobrađen pa hero vodi na /obavijesti
  useEffect(() => {
    function onOpenRequest(e: Event) {
      if (mode === 'ready' || mode === 'ios-install') {
        e.preventDefault()
        setOpen(mode === 'ios-install' ? 'ios' : 'settings')
      }
    }
    window.addEventListener('nkvv:open-push', onOpenRequest)
    return () => window.removeEventListener('nkvv:open-push', onOpenRequest)
  }, [mode])

  async function save(next: Prefs) {
    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        if (permission === 'denied') setMode('denied')
        return
      }
      const keyRes = await fetch('/api/push/key')
      if (!keyRes.ok) throw new Error('push not configured')
      const { key } = await keyRes.json()

      const reg = await navigator.serviceWorker.ready
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        }))

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sub.toJSON(),
          categories: next.categories,
          notifyResults: next.notifyResults,
          notifyReminders: next.notifyReminders,
        }),
      })
      if (!res.ok) throw new Error('save failed')

      localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      setPrefs(next)
      const firstTime = !subscribed
      setSubscribed(true)
      setOpen(false)

      // Testna obavijest odmah — korisnik vidi da sve radi
      try {
        await reg.showNotification(
          firstTime ? 'Obavijesti su uključene! 🟠' : 'Postavke su spremljene',
          {
            body: 'Ovako će ti stizati obavijesti o utakmicama NK Veli Vrh. Idemo, narančasti!',
            icon: '/images/icon-192.png',
            badge: '/images/icon-192.png',
            data: { url: '/utakmice' },
          },
        )
      } catch {
        /* nije kritično */
      }
    } catch (err) {
      console.error('[push] save failed:', err)
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
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
      setSubscribed(false)
      setOpen(false)
    } catch (err) {
      console.error('[push] disable failed:', err)
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'hidden') return null

  const title =
    mode === 'ios-install'
      ? 'Kako uključiti obavijesti na iPhoneu'
      : mode === 'denied'
        ? 'Obavijesti su blokirane u postavkama preglednika'
        : subscribed
          ? 'Postavke obavijesti'
          : 'Uključi obavijesti o utakmicama'

  return (
    <>
      <button
        onClick={() => setOpen(mode === 'ios-install' ? 'ios' : 'settings')}
        disabled={mode === 'denied'}
        title={title}
        aria-label={title}
        className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3.5 shadow-xl transition-all cursor-pointer ${
          subscribed
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-gray-900 text-white hover:bg-orange-500 ring-2 ring-white/30'
        } ${mode === 'denied' ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {subscribed ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
        <span
          className="hidden sm:inline text-sm font-black italic uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          Obavijesti
        </span>
      </button>

      {open === 'ios' && <IosInstallGuide onClose={() => setOpen(false)} />}
      {open === 'settings' && mode === 'ready' && (
        <SettingsPanel
          subscribed={subscribed}
          prefs={prefs}
          busy={busy}
          onSave={save}
          onDisable={disable}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
