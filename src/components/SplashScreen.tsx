'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const CREATORS = ['Caio', 'Henrique', 'Lucas', 'Nefi', 'David']
const CONTACT  = '(19) 99312-2734'

export default function SplashScreen() {
  const [visible, setVisible] = useState(() =>
    typeof window !== 'undefined' && !sessionStorage.getItem('splashShown')
  )
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!visible) return

    // Start fade-out after 7.6s, unmount after fade completes (1.1s) → ~8.7s total
    const t1 = setTimeout(() => setFading(true), 7600)
    const t2 = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('splashShown', '1')
    }, 8700)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
