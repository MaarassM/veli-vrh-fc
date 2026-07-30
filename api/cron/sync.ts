// api/cron/sync.ts — tanki handler; sva logika u lib/hns/sync-core.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runSync } from '../../lib/hns/sync-core.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startTime = Date.now()
  try {
    const result = await runSync()
    console.log(`[sync] Done in ${Date.now() - startTime}ms`, result.counts)
    return res.status(200).json({
      success: true,
      duration_ms: Date.now() - startTime,
      ...result,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sync] Fatal:', message)
    return res.status(500).json({ success: false, error: message })
  }
}
