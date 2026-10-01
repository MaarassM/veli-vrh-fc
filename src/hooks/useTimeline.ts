import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { timelineEvents } from '@/data/timeline'
import type { TimelineEvent } from '@/types'

export interface TimelineRow {
  id: string
  year: number
  title: string
  description: string
  category: TimelineEvent['category']
  sort_order: number
}

export function useTimeline(): TimelineEvent[] {
  const [events, setEvents] = useState<TimelineEvent[]>(timelineEvents)

  useEffect(() => {
    supabase
      .from('timeline_events')
      .select('id, year, title, description, category')
      .order('year', { ascending: true })
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setEvents(data as TimelineEvent[])
      })
  }, [])

  return events
}
