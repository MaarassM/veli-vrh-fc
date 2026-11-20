import { useEffect, useState } from 'react'
import { Loader2, Trash2, Plus, Pencil, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { comparePlayers, toPlayer, type PlayerRow } from '@/lib/players'
import { PLAYER_POSITIONS, type Player } from '@/types/player'
import { Field, inputClass, primaryButtonClass, iconButtonClass, errorText } from './fields'

const emptyForm = { first_name: '', last_name: '', number: '', position: '' }

export default function PlayersAdmin() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<Player | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    const { data, error: loadError } = await supabase
      .from('team_players')
      .select('id, first_name, last_name, number, position')
    if (loadError) setError(`Učitavanje nije uspjelo: ${loadError.message}`)
    else setPlayers(((data ?? []) as PlayerRow[]).map(toPlayer).sort(comparePlayers))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(player: Player) {
    setEditing(player)
    setForm({
      first_name: player.firstName,
      last_name: player.lastName,
      number: player.number?.toString() ?? '',
      position: player.position ?? '',
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
      const fields = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        number: form.number ? Number(form.number) : null,
        position: form.position || null,
      }
      if (editing) {
        const { error: updateError } = await supabase.from('team_players').update(fields).eq('id', editing.id)
        if (updateError) throw new Error(updateError.message)
      } else {
        const { error: insertError } = await supabase.from('team_players').insert(fields)
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

  async function remove(player: Player) {
    if (!confirm(`Maknuti "${player.firstName} ${player.lastName}" iz momčadi?`)) return
    setBusy(true)
    const { error: deleteError } = await supabase.from('team_players').delete().eq('id', player.id)
    if (deleteError) setError(`Brisanje nije uspjelo: ${deleteError.message}`)
    else {
      if (editing?.id === player.id) resetForm()
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

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {players.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">
            Momčad je prazna — stranica prikazuje "Popis igrača uskoro". Dodaj prvog igrača ispod.
          </p>
        )}
        {players.map(player => (
          <div key={player.id} className="flex items-center gap-3 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white tabular-nums">
              {player.number ?? '–'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 truncate">
                {player.firstName} {player.lastName}
              </div>
              <div className="text-xs text-gray-400 truncate">{player.position ?? 'Bez pozicije'}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => startEdit(player)} disabled={busy} aria-label="Uredi" className={iconButtonClass}>
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(player)}
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
          <h3 className="heading-club text-xl text-gray-900">{editing ? 'Uredi igrača' : 'Novi igrač'}</h3>
          {editing && (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 cursor-pointer">
              <X className="h-4 w-4" /> Odustani
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="pl-first" label="Ime *">
            <input id="pl-first" required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className={inputClass} />
          </Field>
          <Field id="pl-last" label="Prezime *">
            <input id="pl-last" required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className={inputClass} />
          </Field>
          <Field id="pl-number" label="Broj dresa (opcionalno)">
            <input
              id="pl-number"
              type="number"
              min={1}
              max={99}
              value={form.number}
              onChange={e => setForm({ ...form, number: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field id="pl-position" label="Pozicija (opcionalno)">
            <select id="pl-position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className={inputClass}>
              <option value="">Bez pozicije</option>
              {PLAYER_POSITIONS.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <button type="submit" disabled={busy || !form.first_name.trim() || !form.last_name.trim()} className={primaryButtonClass}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editing ? 'Spremi promjene' : 'Dodaj igrača'}
        </button>
      </form>
    </div>
  )
}
