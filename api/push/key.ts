import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const key = process.env.VAPID_PUBLIC_KEY
  if (!key) {
    return res.status(503).json({ error: 'Push not configured' })
  }
  res.setHeader('Cache-Control', 's-maxage=86400')
  return res.status(200).json({ key })
}
