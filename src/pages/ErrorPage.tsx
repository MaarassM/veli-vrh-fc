import { Link, useRouteError } from 'react-router'
import { RotateCcw, Home } from 'lucide-react'

// Zamjena za tehnički ispis greške koji React Router prikazuje po defaultu.
export default function ErrorPage() {
  const error = useRouteError()
  const detail = error instanceof Error ? error.message : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <p className="heading-club text-6xl text-orange-500 mb-2">Ups!</p>
        <h1 className="heading-club text-3xl text-gray-900 mb-3">Nešto je zapelo</h1>
        <p className="text-gray-500 mb-8">
          Stranica se nije uspjela prikazati. Pokušaj osvježiti ili se vrati na početnu —
          ako se ponovi, javi nam na{' '}
          <a href="mailto:nkvelivrh@gmail.com" className="text-orange-500 hover:text-orange-600">
            nkvelivrh@gmail.com
          </a>
          .
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" /> Osvježi stranicu
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-orange-500 hover:border-orange-300 transition-colors"
          >
            <Home className="h-4 w-4" /> Početna
          </Link>
        </div>

        {detail && (
          <p className="mt-8 text-xs text-gray-300 break-words">{detail}</p>
        )}
      </div>
    </div>
  )
}
