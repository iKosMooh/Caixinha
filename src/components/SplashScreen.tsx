'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const CREATORS = ['Caio', 'Henrique', 'Lucas', 'Nefi', 'David']
const CONTACT  = '(19) 99312-2734'

export default function SplashScreen() {
  // false no server → hydration match. useEffect corre só no client após hydration.
  const [visible, setVisible] = useState(false)
  const [fading, setFading]   = useState(false)

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>

    // requestAnimationFrame move setVisible para fora do corpo do effect (satisfaz linter)
    const raf = requestAnimationFrame(() => {
      if (sessionStorage.getItem('splashShown')) return

      setVisible(true)

      // Fade-out após 7.6s, unmount após 8.7s
      t1 = setTimeout(() => setFading(true), 7600)
      t2 = setTimeout(() => {
        setVisible(false)
        sessionStorage.setItem('splashShown', '1')
      }, 8700)
    })

    // Cleanup correto: cancela RAF e ambos os timers se component desmontar
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        opacity:    fading ? 0 : 1,
        transition: fading ? 'opacity 1100ms cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center
        bg-white px-8 select-none pointer-events-none"
    >
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/CSS.png"
          alt="Caixinha"
          width={240}
          height={240}
          style={{ width: 240, height: 'auto' }}
          className="drop-shadow-md"
          priority
        />
      </div>

      {/* Contact under logo */}
      <p className="text-base font-semibold text-gray-500 mb-10 tracking-wide">
        {CONTACT}
      </p>

      {/* Divider */}
      <div className="w-16 h-px bg-gray-200 mb-8" />

      {/* Developed by */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Desenvolvido por
      </p>
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {CREATORS.map((name) => (
          <li key={name} className="text-lg font-bold text-gray-700">
            {name}
          </li>
        ))}
      </ul>
    </div>
  )
}
