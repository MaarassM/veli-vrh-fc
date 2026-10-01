import { useEffect, useState } from 'react'
import { Loader2, Trash2, Plus, Pencil, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { TimelineRow } from '@/hooks/useTimeline'
import { Field, inputClass, primaryButtonClass, iconButtonClass, errorText } from './fields'

const categoryLabels: Record<TimelineRow['category'], string> = {
  founding: 'Osnivanje',
  achievement: 'Uspjeh',
  milestone: 'Prekretnica',
  infrastructure: 'Infrastruktura',
}

const emptyForm = { year: '', title: '', description: '', category: 'milestone' as TimelineRow['category'] }

export default function TimelineAdmin() {
  const [events, setEvents] = useState<TimelineRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<TimelineRow | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    const { data, error: loadError } = await supabase
      .from('timeline_events')
      .select('*')
      .order('year', { ascending: true })
      .order('sort_order', { ascending: true })
    if (loadError) setError(`Učitavanje nije uspjelo: ${loadError.message}`)
    else setEvents(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(event: TimelineRow) {
    setEditing(event)
    setForm({ year: String(event.year), title: event.title, description: event.description, category: event.category })
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  function resetForm() {
    setEditing(null)
    setForm(emptyForm)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const fields = {
        year: Number(form.year),
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
      }
      if (editing) {
        const { error: updateError } = await supabase.from('timeline_events').update(fields).eq('id', editing.id)
        if (updateError) throw new Error(updateError.message)
      } else {
        const maxOrder = events.reduce((m, ev) => Math.max(m, ev.sort_order), 0)
        const { error: insertError } = await supabase.from('timeline_events').insert({ ...fields, sort_order: maxOrder + 1 })
        if (insertError) throw new Error(insertError.message)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(`Spremanje nije uspjelo: ${errorText(err)}`)
    } finally {
      setBusy(false)
    }
  }

  async function remove(event: TimelineRow) {
    if (!confirm(`Obrisati događaj "${event.year} — ${event.title}"?`)) return
    setBusy(true)
    const { error: deleteError } = await supabase.from('timeline_events').delete().eq('id', event.id)
    if (deleteError) setError(`Brisanje nije uspjelo: ${deleteError.message}`)
    else {
      if (editing?.id === event.id) resetForm()
      await load()
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

  const yearValid = /^\d{4}$/.test(form.year)

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {events.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">
            Tablica je prazna — stranica prikazuje zadanu povijest iz koda. Dodaj prvi događaj ispod.
          </p>
        )}
        {events.map(event => (
          <div key={event.id} className="flex items-start gap-3 p-4">
            <span className="font-display text-lg font-bold text-orange-500 w-14 shrink-0">{event.year}</span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900">{event.title}</div>
              <div className="text-xs text-gray-400">{categoryLabels[event.category]}</div>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{event.description}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => startEdit(event)} disabled={busy} aria-label="Uredi" className={iconButtonClass}>
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(event)}
                disabled={busy}
                aria-label="Obriši"
                className="p-2.5 text-gray-400 hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={save} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="heading-club text-xl text-gray-900">{editing ? 'Uredi događaj' : 'Novi događaj'}</h3>
          {editing && (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 cursor-pointer">
              <X className="h-4 w-4" /> Odustani
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr_12rem] gap-4">
          <Field id="tl-year" label="Godina *">
            <input
              id="tl-year"
              required
              inputMode="numeric"
              placeholder="1975"
              value={form.year}
              onChange={e => setForm({ ...form, year: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field id="tl-title" label="Naslov *">
            <input id="tl-title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </Field>
          <Field id="tl-cat" label="Kategorija">
            <select
              id="tl-cat"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as TimelineRow['category'] })}
              className={inputClass}
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field id="tl-desc" label="Opis *">
          <textarea
            id="tl-desc"
            required
            rows={5}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </Field>
        <button type="submit" disabled={busy || !yearValid || !form.title.trim() || !form.description.trim()} className={primaryButtonClass}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editing ? 'Spremi promjene' : 'Dodaj događaj'}
        </button>
      </form>
    </div>
  )
}
