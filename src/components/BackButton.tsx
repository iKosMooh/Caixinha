'use client'

import { useRouter } from 'next/navigation'

interface Props {
  label?: string
  fallbackHref?: string
}

export default function BackButton({ label = 'Voltar', fallbackHref }: Props) {
  const router = useRouter()

  function handleBack() {
    if (fallbackHref && window.history.length <= 1) {
      router.push(fallbackHref)
    } else {
      router.back()
    }
  }

  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-gray-50/95 backdrop-blur-sm
      border-b border-gray-100 mb-4">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500
          hover:text-blue-600 transition-colors min-h-[36px]"
        aria-label={label}
      >
        <span className="text-lg leading-none">←</span>
        {label}
      </button>
    </div>
  )
}
