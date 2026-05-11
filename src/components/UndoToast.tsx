'use client'

import { useEffect, useState } from 'react'

interface UndoToastProps {
  message: string
  onUndo: () => void
  onExpire?: () => void
  duration?: number // ms
}

export default function UndoToast({ message, onUndo, onExpire, duration = 10_000 }: UndoToastProps) {
  const [remaining, setRemaining] = useState(Math.round(duration / 1000))
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const tick = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(tick)
          setVisible(false)
          onExpire?.()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [onExpire])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4
        bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl text-base font-medium
        max-w-[90vw]"
    >
      <span>{message}</span>
      <span className="text-gray-400 text-sm">({remaining}s)</span>
      <button
        onClick={() => { setVisible(false); onUndo() }}
        className="ml-2 bg-blue-500 hover:bg-blue-400 rounded-lg px-3 py-1 text-sm font-bold
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-white min-h-[36px]"
      >
        Desfazer
      </button>
    </div>
  )
}
