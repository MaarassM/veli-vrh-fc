import type { ReactNode } from 'react'

// Naslov manje sekcije unutar stranice — ista klupska tipografija kao PageHeader
export default function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`heading-club text-2xl text-gray-900 ${className}`}>{children}</h2>
}
