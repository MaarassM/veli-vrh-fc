import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper za dobivanje public URL slike iz Supabase Storagea
export function getStorageUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/gallery/${path}`
}
