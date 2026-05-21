'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { verifyPin } from '@/app/actions/pin'

interface Props {
  hasPin: boolean
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function PinGate({ hasPin }: Props) {
  const [visible, setVisible]   = useState(false)
  const [digits, setDigits]     = useState<string[]>([])
  const [error, setError]       = useState(false)
  const [isPending, startTransition] = useTransition()
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!hasPin) return
      if (sessionStorage.getItem('pinVerified')) return
      if (mounted.current) setVisible(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [hasPin])

  function press(key: string) {
    if (isPending) return
    setError(false)

    if (key === '⌫') {
      setDigits((d) => d.slice(0, -1))
      return
    }
    if (key === '') return
    if (digits.length >= 4) return

    const next = [...digits, key]
    setDigits(next)

    if (next.length === 4) {
      startTransition(async () => {
        const ok = await verifyPin(next.join(''))
        if (!mounted.current) return           // navegou antes de responder
        if (ok) {
          sessionStorage.setItem('pinVerified', '1')
          setVisible(false)
        } else {
          setError(true)
          setDigits([])
        }
      })
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center
      bg-white px-6 select-none">

      <p className="text-2xl font-extrabold text-gray-900 mb-1">🔐 Caixinha</p>
      <p className="text-sm text-gray-500 mb-8">Digite o PIN de 4 dígitos</p>

      {/* Dots */}
      <div className="flex gap-4 mb-8">
        {[0,1,2,3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-colors ${
              error
                ? 'bg-red-500 border-red-500'
                : digits.length > i
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-transparent border-gray-300'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm font-semibold text-red-600 mb-4">PIN incorreto. Tente novamente.</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
        {KEYS.map((key, i) => (
          <button
            key={i}
            onClick={() => press(key)}
            disabled={key === '' || isPending}
            className={`h-16 rounded-2xl text-xl font-bold transition-colors
              ${key === ''
                ? 'invisible'
                : key === '⌫'
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-900 hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100'
              }`}
          >
            {key}
          </button>
        ))}
      </div>

      {isPending && (
        <p className="text-sm text-gray-400 mt-6">Verificando…</p>
      )}
    </div>
  )
}
