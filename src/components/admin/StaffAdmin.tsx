import { useEffect, useState } from 'react'
import { Loader2, Trash2, Plus, Pencil, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { StaffRow } from '@/hooks/useStaff'
import { Field, inputClass, primaryButtonClass, iconButtonClass, MEDIA_URL_PREFIX, errorText } from './fields'

const emptyForm = { first_name: '', last_name: '', role: '', since: '' }

export default function StaffAdmin() {
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<StaffRow | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    const { data, error: loadError } = await supabase
      .from('staff')
      .select('*')
      .order('sort_order', { ascending: true })
    if (loadError) setError(`Učitavanje nije uspjelo: ${loadError.message}`)
    else setStaff(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(member: StaffRow) {
    setEditing(member)
    setForm({
      first_name: member.first_name,
      last_name: member.last_name,
      role: member.role,
      since: member.since ?? '',
    })
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
      // Fotografije stožera se ne prikazuju — zadržavamo postojeću vrijednost u bazi
      const image_url = editing?.image_url ?? null
      const fields = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        role: form.role.trim(),
        since: form.since.trim() || null,
        image_url,
      }
      if (editing) {
        const { error: updateError } = await supabase.from('staff').update(fields).eq('id', editing.id)
        if (updateError) throw new Error(updateError.message)
      } else {
        const maxOrder = staff.reduce((m, s) => Math.max(m, s.sort_order), 0)
        const { error: insertError } = await supabase.from('staff').insert({ ...fields, sort_order: maxOrder + 1 })
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

  async function remove(member: StaffRow) {
    if (!confirm(`Obrisati "${member.first_name} ${member.last_name}"?`)) return
    setBusy(true)
    const { error: deleteError } = await supabase.from('staff').delete().eq('id', member.id)
    if (deleteError) setError(`Brisanje nije uspjelo: ${deleteError.message}`)
    else {
      if (member.image_url?.startsWith(MEDIA_URL_PREFIX)) {
        await supabase.storage.from('media').remove([member.image_url.slice(MEDIA_URL_PREFIX.length)])
      }
      if (editing?.id === member.id) resetForm()
      await load()
    }
    setBusy(false)
  }

  async function move(member: StaffRow, direction: -1 | 1) {
    const index = staff.findIndex(s => s.id === member.id)
    const other = staff[index + direction]
    if (!other) return
    setBusy(true)
    await supabase.from('staff').update({ sort_order: other.sort_order }).eq('id', member.id)
    await supabase.from('staff').update({ sort_order: member.sort_order }).eq('id', other.id)
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
        {staff.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">
            Tablica je prazna — stranica prikazuje zadani popis iz koda. Dodaj prvu osobu ispod.
          </p>
        )}
        {staff.map((member, i) => (
          <div key={member.id} className="flex items-center gap-3 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400">
              {member.first_name[0]}{member.last_name[0]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 truncate">
                {member.first_name} {member.last_name}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {member.role}
                {member.since && ` · od ${member.since}`}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => move(member, -1)} disabled={busy || i === 0} aria-label="Pomakni gore" className={iconButtonClass}>
                ↑
              </button>
              <button
                onClick={() => move(member, 1)}
                disabled={busy || i === staff.length - 1}
                aria-label="Pomakni dolje"
                className={iconButtonClass}
              >
                ↓
              </button>
              <button onClick={() => startEdit(member)} disabled={busy} aria-label="Uredi" className={iconButtonClass}>
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(member)}
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
          <h3 className="heading-club text-xl text-gray-900">{editing ? 'Uredi osobu' : 'Nova osoba'}</h3>
          {editing && (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 cursor-pointer">
              <X className="h-4 w-4" /> Odustani
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="st-first" label="Ime *">
            <input id="st-first" required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className={inputClass} />
          </Field>
          <Field id="st-last" label="Prezime *">
            <input id="st-last" required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className={inputClass} />
          </Field>
          <Field id="st-role" label="Uloga *">
            <input
              id="st-role"
              required
              placeholder="npr. Predsjednik, Glavni trener, Uprava kluba"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field id="st-since" label="U klubu od (opcionalno)">
            <input id="st-since" placeholder="npr. 2021" value={form.since} onChange={e => setForm({ ...form, since: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <button type="submit" disabled={busy || !form.first_name.trim() || !form.last_name.trim() || !form.role.trim()} className={primaryButtonClass}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editing ? 'Spremi promjene' : 'Dodaj osobu'}
        </button>
      </form>
    </div>
  )
}
