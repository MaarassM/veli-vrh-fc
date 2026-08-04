import { useEffect, useState } from 'react'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SponsorRow {
  id: string
  name: string
  logo_url: string | null
  url: string | null
  sort_order: number
}

const MEDIA_URL_PREFIX = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media/`

export default function SponsorsAdmin() {
  const [sponsors, setSponsors] = useState<SponsorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  async function load() {
    const { data, error: loadError } = await supabase
      .from('sponsors')
      .select('*')
      .order('sort_order', { ascending: true })
    if (loadError) setError(`Učitavanje nije uspjelo: ${loadError.message}`)
    else setSponsors(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function addSponsor(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      let logo_url: string | null = null
      if (logoFile) {
        const path = `sponsors/${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { error: uploadError } = await supabase.storage.from('media').upload(path, logoFile)
        if (uploadError) throw new Error(`upload loga: ${uploadError.message}`)
        logo_url = MEDIA_URL_PREFIX + path
      }
      const maxOrder = sponsors.reduce((m, s) => Math.max(m, s.sort_order), 0)
      const { error: insertError } = await supabase.from('sponsors').insert({
        name: name.trim(),
        url: url.trim() || null,
        logo_url,
        sort_order: maxOrder + 1,
      })
      if (insertError) throw new Error(insertError.message)
      setName('')
      setUrl('')
      setLogoFile(null)
      await load()
    } catch (err) {
      setError(`Spremanje nije uspjelo: ${err instanceof Error ? err.message : err}`)
    } finally {
      setBusy(false)
    }
  }

  async function removeSponsor(sponsor: SponsorRow) {
    if (!confirm(`Obrisati sponzora "${sponsor.name}"?`)) return
    setBusy(true)
    const { error: deleteError } = await supabase.from('sponsors').delete().eq('id', sponsor.id)
    if (deleteError) setError(`Brisanje nije uspjelo: ${deleteError.message}`)
    else {
      if (sponsor.logo_url?.startsWith(MEDIA_URL_PREFIX)) {
        await supabase.storage.from('media').remove([sponsor.logo_url.slice(MEDIA_URL_PREFIX.length)])
      }
      await load()
    }
    setBusy(false)
  }

  async function move(sponsor: SponsorRow, direction: -1 | 1) {
    const sorted = [...sponsors]
    const index = sorted.findIndex(s => s.id === sponsor.id)
    const other = sorted[index + direction]
    if (!other) return
    setBusy(true)
    await supabase.from('sponsors').update({ sort_order: other.sort_order }).eq('id', sponsor.id)
    await supabase.from('sponsors').update({ sort_order: sponsor.sort_order }).eq('id', other.id)
    await load()
    setBusy(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {sponsors.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">Još nema sponzora — dodaj prvog ispod.</p>
        )}
        {sponsors.map((sponsor, i) => (
          <div key={sponsor.id} className="flex items-center gap-3 p-4">
            {sponsor.logo_url ? (
              <img src={sponsor.logo_url} alt="" className="h-10 w-16 object-contain shrink-0" />
            ) : (
              <span className="h-10 w-16 shrink-0 rounded bg-gray-100" />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 truncate">{sponsor.name}</div>
              {sponsor.url && <div className="text-xs text-gray-400 truncate">{sponsor.url}</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => move(sponsor, -1)}
                disabled={busy || i === 0}
                aria-label="Pomakni gore"
                className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                ↑
              </button>
              <button
                onClick={() => move(sponsor, 1)}
                disabled={busy || i === sponsors.length - 1}
                aria-label="Pomakni dolje"
                className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                ↓
              </button>
              <button
                onClick={() => removeSponsor(sponsor)}
                disabled={busy}
                aria-label="Obriši"
                className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={addSponsor} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="heading-club text-xl text-gray-900">Novi sponzor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sp-name" className="block text-sm font-semibold text-gray-700 mb-1">
              Naziv *
            </label>
            <input
              id="sp-name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="sp-url" className="block text-sm font-semibold text-gray-700 mb-1">
              Web stranica (opcionalno)
            </label>
            <input
              id="sp-url"
              type="url"
              placeholder="https://…"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="sp-logo" className="block text-sm font-semibold text-gray-700 mb-1">
            Logo (opcionalno)
          </label>
          <input
            id="sp-logo"
            type="file"
            accept="image/*"
            onChange={e => setLogoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-orange-600 file:cursor-pointer"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Dodaj sponzora
        </button>
      </form>
    </div>
  )
}
