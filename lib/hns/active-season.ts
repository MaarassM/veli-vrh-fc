// Aktivna sezona za API-je = najnovija sezona koja stvarno postoji u bazi.
// Datumska heuristika (currentSeason) ljeti pokazuje sezonu koje još nema,
// pa bi API-ji vraćali prazno dok Semafor ne otvori nova natjecanja.
import type { SupabaseClient } from '@supabase/supabase-js'
import { currentSeason } from './discovery.js'

export async function activeSeason(supabase: SupabaseClient): Promise<string> {
  const { data } = await supabase
    .from('competitions')
    .select('season')
    .order('season', { ascending: false })
    .limit(1)
  return data?.[0]?.season ?? currentSeason(new Date())
}
