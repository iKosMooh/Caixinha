'use client'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border-2 border-red-300 bg-red-50 p-6 text-center space-y-4"
    >
      <p className="text-2xl font-bold text-red-800">Algo deu errado</p>
      <p className="text-red-700 text-sm break-words">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-red-700 text-white font-semibold px-6 py-3 min-h-[44px]
          hover:bg-red-800 focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:outline-none"
      >
        Tentar novamente
      </button>
    </div>
  )
}
