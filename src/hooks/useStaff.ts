import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { staffMembers } from '@/data/staff'
import type { StaffMember } from '@/types'

export interface StaffRow {
  id: string
  first_name: string
  last_name: string
  role: string
  image_url: string | null
  since: string | null
  sort_order: number
}

export function toStaffMember(row: StaffRow): StaffMember {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    image: row.image_url,
    since: row.since,
  }
}

export function useStaff(): StaffMember[] {
  const [staff, setStaff] = useState<StaffMember[]>(staffMembers)

  useEffect(() => {
    supabase
      .from('staff')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setStaff((data as StaffRow[]).map(toStaffMember))
      })
  }, [])

  return staff
}
