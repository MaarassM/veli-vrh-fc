import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Album, GalleryItem } from '@/types'

interface AlbumRow {
  id: string
  title: string
  description: string
  cover_image_url: string | null
  sort_order: number
}

interface GalleryItemRow {
  id: string
  album_id: string
  type: 'image' | 'video'
  src: string
  caption: string | null
  date: string | null
  tags: string[] | null
  sort_order: number
}

export function useAlbums() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAlbums() {
      const { data, error } = await supabase
        .from('albums')
        .select(`
          id, title, description, cover_image_url, sort_order,
          gallery_items(count)
        `)
        .order('sort_order', { ascending: true })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const mapped: Album[] = (data as any[]).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description ?? '',
        coverImage: row.cover_image_url ?? '/images/placeholder.jpg',
        itemCount: row.gallery_items?.[0]?.count ?? 0
      }))

      setAlbums(mapped)
      setLoading(false)
    }

    fetchAlbums()
  }, [])

  return { albums, loading, error }
}

export function useGalleryItems(albumId: string | null) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!albumId) {
      setItems([])
      return
    }

    setLoading(true)

    async function fetchItems() {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('album_id', albumId)
        .order('date', { ascending: false })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const mapped: GalleryItem[] = (data as GalleryItemRow[]).map(row => ({
        id: row.id,
        type: row.type,
        src: row.src,
        caption: row.caption ?? '',
        date: row.date ?? '',
        tags: row.tags ?? [],
        albumId: row.album_id
      }))

      setItems(mapped)
      setLoading(false)
    }

    fetchItems()
  }, [albumId])

  return { items, loading, error }
}
