'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
  { href: '/',        label: 'Início',   icon: '🏠' },
  { href: '/entrada', label: 'Entrada',  icon: '➕' },
  { href: '/saida',   label: 'Saída',    icon: '➖' },
  { href: '/estoque', label: 'Estoque',  icon: '📋' },
  { href: '/lista',   label: 'Lista',    icon: '🛒' },
]

export default function BottomNav() {
  const rawPathname = usePathname()
  const [pathname, setPathname] = useState('/')
  useEffect(() => { setPathname(rawPathname) }, [rawPathname])
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200
        flex items-stretch safe-bottom"
      aria-label="Navegação principal"
    >
      {links.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5
              min-h-[60px] py-2 text-xs font-semibold transition-colors
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500
              ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="text-2xl leading-none" aria-hidden="true">{icon}</span>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
