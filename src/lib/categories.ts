// Kategorije kluba — dijele ih stranica kategorija i generator SEO ruta.
export const CATEGORY_TABS = [
  { key: 'seniori',       label: 'Seniori' },
  { key: 'juniori',       label: 'Juniori' },
  { key: 'pioniri',       label: 'Pioniri' },
  { key: 'mladi-pioniri', label: 'Mlađi pioniri' },
  { key: 'u-11',          label: 'U-11' },
  { key: 'u-9',           label: 'U-9' },
  { key: 'veterani',      label: 'Veterani' },
] as const

export type CategoryKey = (typeof CATEGORY_TABS)[number]['key']

export function categoryLabel(key: string | undefined): string {
  return CATEGORY_TABS.find(t => t.key === key)?.label ?? 'Seniori'
}
