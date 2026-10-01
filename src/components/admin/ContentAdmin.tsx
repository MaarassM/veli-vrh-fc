import { useEffect, useState, type ReactNode } from 'react'
import { Loader2, Plus, Save, Trash2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { defaultContent, resolveContent, type ContentKey, type SiteContent, type Stat } from '@/lib/content'
import { Field, inputClass, primaryButtonClass, errorText } from './fields'

const BOLD_HINT = 'Za podebljani tekst stavi ga između dvije zvjezdice: **ovako**.'

function Section({
  title,
  hint,
  onSave,
  saving,
  saved,
  children,
}: {
  title: string
  hint?: string
  onSave: () => void
  saving: boolean
  saved: boolean
  children: ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div>
        <h3 className="heading-club text-xl text-gray-900">{title}</h3>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
      {children}
      <button type="button" onClick={onSave} disabled={saving} className={primaryButtonClass}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? 'Spremljeno' : 'Spremi'}
      </button>
    </section>
  )
}

function StatFields({ id, stat, onChange }: { id: string; stat: Stat; onChange: (stat: Stat) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3">
      <Field id={`${id}-value`} label="Vrijednost">
        <input id={`${id}-value`} value={stat.value} onChange={e => onChange({ ...stat, value: e.target.value })} className={inputClass} />
      </Field>
      <Field id={`${id}-label`} label="Naslov">
        <input id={`${id}-label`} value={stat.label} onChange={e => onChange({ ...stat, label: e.target.value })} className={inputClass} />
      </Field>
      <Field id={`${id}-desc`} label="Opis">
        <input id={`${id}-desc`} value={stat.description} onChange={e => onChange({ ...stat, description: e.target.value })} className={inputClass} />
      </Field>
    </div>
  )
}

function StringList({
  id,
  items,
  onChange,
  multiline,
  addLabel,
}: {
  id: string
  items: string[]
  onChange: (items: string[]) => void
  multiline?: boolean
  addLabel: string
}) {
  const update = (i: number, value: string) => onChange(items.map((item, j) => (j === i ? value : item)))
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline ? (
            <textarea id={`${id}-${i}`} rows={4} value={item} onChange={e => update(i, e.target.value)} className={inputClass} />
          ) : (
            <input id={`${id}-${i}`} value={item} onChange={e => update(i, e.target.value)} className={inputClass} />
          )}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Ukloni"
            className="p-2.5 text-gray-400 hover:text-red-500 cursor-pointer shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 cursor-pointer"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  )
}

export default function ContentAdmin() {
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<ContentKey | null>(null)
  const [saved, setSaved] = useState<ContentKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('site_content')
      .select('key, value')
      .then(({ data, error: loadError }) => {
        if (loadError) setError(`Učitavanje nije uspjelo: ${loadError.message}`)
        else {
          const next = { ...defaultContent }
          for (const row of data ?? []) {
            if (row.key in defaultContent) {
              const key = row.key as ContentKey
              ;(next as Record<ContentKey, unknown>)[key] = resolveContent(key, row.value)
            }
          }
          setContent(next)
        }
        setLoading(false)
      })
  }, [])

  function edit<K extends ContentKey>(key: K, value: SiteContent[K]) {
    setContent(prev => ({ ...prev, [key]: value }))
    if (saved === key) setSaved(null)
  }

  async function save(key: ContentKey) {
    setSaving(key)
    setError(null)
    try {
      const { error: saveError } = await supabase
        .from('site_content')
        .upsert({ key, value: content[key], updated_at: new Date().toISOString() })
      if (saveError) throw new Error(saveError.message)
      setSaved(key)
    } catch (err) {
      setError(`Spremanje nije uspjelo: ${errorText(err)}`)
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  const { home_intro, club_values, about_overview, stadium } = content
  const sectionProps = (key: ContentKey) => ({ onSave: () => save(key), saving: saving === key, saved: saved === key })

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Section title="Početna — uvodni tekst" {...sectionProps('home_intro')}>
        <textarea
          id="c-intro"
          aria-label="Uvodni tekst"
          rows={4}
          value={home_intro.text}
          onChange={e => edit('home_intro', { text: e.target.value })}
          className={inputClass}
        />
      </Section>

      <Section title="Početna — naše vrijednosti" {...sectionProps('club_values')}>
        {club_values.items.map((item, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-3 rounded-xl bg-gray-50 p-3">
            <Field id={`c-val-${i}-title`} label={`Kartica ${i + 1} — naslov`}>
              <input
                id={`c-val-${i}-title`}
                value={item.title}
                onChange={e =>
                  edit('club_values', { items: club_values.items.map((it, j) => (j === i ? { ...it, title: e.target.value } : it)) })
                }
                className={inputClass}
              />
            </Field>
            <Field id={`c-val-${i}-body`} label="Tekst">
              <textarea
                id={`c-val-${i}-body`}
                rows={2}
                value={item.body}
                onChange={e =>
                  edit('club_values', { items: club_values.items.map((it, j) => (j === i ? { ...it, body: e.target.value } : it)) })
                }
                className={inputClass}
              />
            </Field>
          </div>
        ))}
      </Section>

      <Section title="O nama — uvod" hint={BOLD_HINT} {...sectionProps('about_overview')}>
        <Field id="c-about-sub" label="Podnaslov">
          <input
            id="c-about-sub"
            value={about_overview.subtitle}
            onChange={e => edit('about_overview', { ...about_overview, subtitle: e.target.value })}
            className={inputClass}
          />
        </Field>
        <div>
          <p className="block text-sm font-semibold text-gray-700 mb-1">Odlomci</p>
          <StringList
            id="c-about-p"
            multiline
            items={about_overview.paragraphs}
            onChange={paragraphs => edit('about_overview', { ...about_overview, paragraphs })}
            addLabel="Dodaj odlomak"
          />
        </div>
        <div className="space-y-2">
          <p className="block text-sm font-semibold text-gray-700">Brojke</p>
          {about_overview.stats.map((stat, i) => (
            <StatFields
              key={i}
              id={`c-about-stat-${i}`}
              stat={stat}
              onChange={next =>
                edit('about_overview', { ...about_overview, stats: about_overview.stats.map((s, j) => (j === i ? next : s)) })
              }
            />
          ))}
        </div>
      </Section>

      <Section title="O nama — igralište" {...sectionProps('stadium')}>
        <div className="space-y-2">
          <p className="block text-sm font-semibold text-gray-700">Kartice (lokacija, dimenzije, kapacitet)</p>
          {stadium.features.map((feature, i) => (
            <StatFields
              key={i}
              id={`c-stad-${i}`}
              stat={feature}
              onChange={next => edit('stadium', { ...stadium, features: stadium.features.map((f, j) => (j === i ? next : f)) })}
            />
          ))}
        </div>
        <div>
          <p className="block text-sm font-semibold text-gray-700 mb-1">Infrastruktura</p>
          <StringList
            id="c-stad-fac"
            items={stadium.facilities}
            onChange={facilities => edit('stadium', { ...stadium, facilities })}
            addLabel="Dodaj stavku"
          />
        </div>
      </Section>
    </div>
  )
}
