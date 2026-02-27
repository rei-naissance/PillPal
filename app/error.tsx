'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Enterprise monitoring: Log errors to an external service in a real scenario
    console.error('PillPal Critical Boundary Caught:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-red-100/50">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
        Something went wrong!
      </h1>
      <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
        PillPal encountered an unexpected error. Please try refreshing the page or starting over.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-black text-white rounded-xl font-medium transition-all shadow-md hover:shadow-xl active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all shadow-sm active:scale-95"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}
