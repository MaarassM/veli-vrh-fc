import { useEffect, useState } from 'react'
import { Loader2, Trash2, Upload, FolderPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AlbumRow {
  id: string
  title: string
  description: string | null
  sort_order: number
}

interface ItemRow {
  id: string
  album_id: string
  src: string
  caption: string | null
  date: string | null
}

const MEDIA_URL_PREFIX = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media/`

export default function GalleryAdmin() {
  const [albums, setAlbums] = useState<AlbumRow[]>([])
  const [albumId, setAlbumId] = useState<string>('')
  const [items, setItems] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newAlbumTitle, setNewAlbumTitle] = useState('')

  async function loadAlbums() {
    const { data } = await supabase.from('albums').select('id, title, description, sort_order').order('sort_order')
    setAlbums(data ?? [])
    if (data && data.length > 0 && !albumId) setAlbumId(data[0].id)
    setLoading(false)
  }

  async function loadItems(id: string) {
    if (!id) return setItems([])
    const { data } = await supabase
      .from('gallery_items')
      .select('id, album_id, src, caption, date')
      .eq('album_id', id)
      .order('date', { ascending: false })
    setItems(data ?? [])
  }

  useEffect(() => {
    loadAlbums()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadItems(albumId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId])

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault()
    const title = newAlbumTitle.trim()
    if (!title) return
    setBusy(true)
    setError(null)
    const id = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const maxOrder = albums.reduce((m, a) => Math.max(m, a.sort_order ?? 0), 0)
    const { error: insertError } = await supabase
      .from('albums')
      .insert({ id, title, sort_order: maxOrder + 1 })
    if (insertError) setError(`Album nije kreiran: ${insertError.message}`)
    else {
      setNewAlbumTitle('')
      await loadAlbums()
      setAlbumId(id)
    }
    setBusy(false)
  }

  async function uploadPhotos(files: FileList | null) {
    if (!files || files.length === 0 || !albumId) return
    setBusy(true)
    setError(null)
    const today = new Date().toISOString().slice(0, 10)
    let done = 0
    for (const file of Array.from(files)) {
      setProgress(`Učitavam ${done + 1}/${files.length}…`)
      try {
        const path = `gallery/${albumId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
        if (uploadError) throw new Error(uploadError.message)
        const { error: insertError } = await supabase.from('gallery_items').insert({
          album_id: albumId,
          type: 'image',
          src: MEDIA_URL_PREFIX + path,
          date: today,
        })
        if (insertError) throw new Error(insertError.message)
        done++
      } catch (err) {
        setError(`Greška kod "${file.name}": ${err instanceof Error ? err.message : err}`)
        break
      }
    }
    setProgress(null)
    setBusy(false)
    await loadItems(albumId)
  }

  async function removeItem(item: ItemRow) {
    if (!confirm('Obrisati ovu fotografiju?')) return
    setBusy(true)
    const { error: deleteError } = await supabase.from('gallery_items').delete().eq('id', item.id)
    if (deleteError) setError(`Brisanje nije uspjelo: ${deleteError.message}`)
    else {
      if (item.src.startsWith(MEDIA_URL_PREFIX)) {
        await supabase.storage.from('media').remove([item.src.slice(MEDIA_URL_PREFIX.length)])
      }
      await loadItems(albumId)
    }
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

      {/* Odabir + novi album */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-48">
            <label htmlFor="album-select" className="block text-sm font-semibold text-gray-700 mb-1">
              Album
            </label>
            <select
              id="album-select"
              value={albumId}
              onChange={e => setAlbumId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none bg-white"
            >
              {albums.map(album => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>
          <form onSubmit={createAlbum} className="flex items-end gap-2 flex-1 min-w-48">
            <div className="flex-1">
              <label htmlFor="album-new" className="block text-sm font-semibold text-gray-700 mb-1">
                Novi album
              </label>
              <input
                id="album-new"
                value={newAlbumTitle}
                onChange={e => setNewAlbumTitle(e.target.value)}
                placeholder="npr. Sezona 2026/27"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !newAlbumTitle.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FolderPlus className="h-4 w-4" /> Kreiraj
            </button>
          </form>
        </div>

        {/* Upload */}
        <div>
          <label
            htmlFor="photo-upload"
            className={`inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors cursor-pointer ${busy ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {busy && progress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {progress ?? 'Dodaj fotografije'}
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => {
              uploadPhotos(e.target.files)
              e.target.value = ''
            }}
          />
          <p className="mt-2 text-xs text-gray-400">Možeš odabrati više fotografija odjednom — idu u odabrani album.</p>
        </div>
      </div>

      {/* Fotke u albumu */}
      {items.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-6">Album je prazan.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map(item => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square">
              <img src={item.src} alt={item.caption ?? ''} className="h-full w-full object-cover" loading="lazy" />
              <button
                onClick={() => removeItem(item)}
                disabled={busy}
                aria-label="Obriši fotografiju"
                className="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-red-500 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
