import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none'

export const primaryButtonClass =
  'inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer'

export const iconButtonClass = 'p-2.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer'

export function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

export const MEDIA_URL_PREFIX = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media/`

export function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
