import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { defaultContent, resolveContent, type ContentKey, type SiteContent } from '@/lib/content'

export function useSiteContent<K extends ContentKey>(key: K): SiteContent[K] {
  const [content, setContent] = useState<SiteContent[K]>(defaultContent[key])

  useEffect(() => {
    let cancelled = false
    supabase
      .from('site_content')
      .select('value')
      .eq('key', key)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setContent(resolveContent(key, data.value))
      })
    return () => {
      cancelled = true
    }
  }, [key])

  return content
}
