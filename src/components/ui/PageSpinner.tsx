import { Loader2 } from 'lucide-react'

/** Kratki međuprikaz dok se dohvaća kod stranice. */
export default function PageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Učitavanje">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  )
}
