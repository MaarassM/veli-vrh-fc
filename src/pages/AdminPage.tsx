import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LogOut, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import SponsorsAdmin from '@/components/admin/SponsorsAdmin'
import GalleryAdmin from '@/components/admin/GalleryAdmin'
import PageHeader from '@/components/ui/PageHeader'
import SEO from '@/components/seo/SEO'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(
        authError.message.includes('Invalid login credentials')
          ? 'Pogrešan email ili lozinka.'
          : `Prijava nije uspjela: ${authError.message}`,
      )
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div>
        <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-700 mb-1">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-700 mb-1">
          Lozinka
        </label>
        <input
          id="admin-password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Prijavi se
      </button>
    </form>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checked, setChecked] = useState(false)
  const [tab, setTab] = useState<'sponzori' | 'galerija'>('sponzori')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecked(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO title="Administracija | NK Veli Vrh" description="Administracija stranice NK Veli Vrh." canonicalPath="/admin" noindex />
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Administracija"
          subtitle={session ? 'Uređivanje sadržaja stranice' : 'Prijava za upravu kluba'}
        />

        {!checked ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : !session ? (
          <LoginForm />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {(['sponzori', 'galerija'] as const).map(key => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                    tab === key
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
                  }`}
                >
                  {key === 'sponzori' ? 'Sponzori' : 'Galerija'}
                </button>
              ))}
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Odjava
              </button>
            </div>

            {tab === 'sponzori' ? <SponsorsAdmin /> : <GalleryAdmin />}
          </>
        )}
      </div>
    </div>
  )
}
