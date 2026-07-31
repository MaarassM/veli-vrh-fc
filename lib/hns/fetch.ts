// HTTP pomoćnici za HNS Semafor — jedan UA, pauza između zahtjeva
export const SEMAFOR_BASE = 'https://semafor.hns.family'
export const USER_AGENT = 'Mozilla/5.0 (compatible; NK-Veli-Vrh-Site/1.0)'

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`HNS returned ${res.status} for ${url}`)
  return res.text()
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`HNS returned ${res.status} for ${url}`)
  return res.json() as Promise<T>
}
