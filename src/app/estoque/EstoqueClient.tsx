'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import SemaphoreBadge from '@/components/SemaphoreBadge'
import type { Lot } from '@/lib/types'

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), { ssr: false })

type Filter = 'todos' | 'vencendo' | 'vencidos' | 'acabando'

const statusLabel: Record<string, string> = {
  fechado: 'Fechado',
  aberto: 'Aberto',
  acabou: 'Acabou',
}

interface GroupedProduct {
  productId: string
  name: string
  image_url: string | null
  barcode: string | null
  lots: Lot[]
  totalQty: number
  hasExpired: boolean
  hasExpiring: boolean
  isLowStock: boolean
}

function groupLots(lots: Lot[]): GroupedProduct[] {
  const map = new Map<string, GroupedProduct>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const lot of lots) {
    const key = String(lot.product_id)
    if (!map.has(key)) {
      map.set(key, {
        productId: key,
        name: lot.product_name ?? '',
        image_url: lot.image_url ?? null,
        barcode: lot.barcode ?? null,
        lots: [],
        totalQty: 0,
        hasExpired: false,
        hasExpiring: false,
        isLowStock: false,
      })
    }
    const g = map.get(key)!
    g.lots.push(lot)
    if (lot.status !== 'acabou') {
      g.totalQty += lot.qty
      if (lot.expiry_date) {
        const exp = new Date(lot.expiry_date)
        exp.setHours(0, 0, 0, 0)
        const diff = Math.floor((exp.getTime() - today.getTime()) / 86_400_000)
        if (diff < 0)       g.hasExpired  = true
        else if (diff <= 7) g.hasExpiring = true
      }
    }
  }
  for (const g of map.values()) g.isLowStock = g.totalQty <= 2
  return Array.from(map.values())
}

export default function EstoqueClient({ lots }: { lots: Lot[] }) {
  const [query,    setQuery]    = useState('')
  const [filter,   setFilter]   = useState<Filter>('todos')
  const [scanning, setScanning] = useState(false)

  const grouped  = useMemo(() => groupLots(lots), [lots])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return grouped.filter((g) => {
      if (filter === 'vencidos'  && !g.hasExpired)  return false
      if (filter === 'vencendo'  && !g.hasExpiring) return false
      if (filter === 'acabando'  && !g.isLowStock)  return false
      if (!q) return true
      return g.name.toLowerCase().includes(q) || (g.barcode ?? '').includes(q)
    })
  }, [grouped, query, filter])

  const filterButtons: { key: Filter; label: string; icon: string }[] = [
    { key: 'todos',    label: 'Todos',    icon: '📦' },
    { key: 'vencendo', label: 'Vencendo', icon: '⏰' },
    { key: 'vencidos', label: 'Vencidos', icon: '⛔' },
    { key: 'acabando', label: 'Acabando', icon: '📉' },
  ]

  return (
    <div className="space-y-4">
      {/* Search + barcode button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">
            🔍
          </span>
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome ou código de barras..."
            className="w-full min-h-[52px] rounded-xl border-2 border-gray-300 pl-12 pr-4 py-2
              text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-label="Buscar produto"
          />
        </div>
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="min-h-[52px] px-4 rounded-xl border-2 border-purple-400 bg-purple-50
            text-purple-900 font-bold text-2xl
            hover:bg-purple-100 transition-colors
            focus-visible:ring-4 focus-visible:ring-purple-400 focus-visible:outline-none"
          aria-label="Escanear código de barras"
        >
          📷
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filterButtons.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl border-2 px-4 py-2
              font-semibold text-sm min-h-[44px] transition-colors
              focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none
              ${filter === key
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            aria-pressed={filter === key}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 font-medium">
        {filtered.length === 0
          ? 'Nenhum produto encontrado'
          : `${filtered.length} produto${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-12">Sem resultados.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <Link
              key={g.productId}
              href={`/estoque/${g.productId}`}
              className="block bg-white rounded-2xl border-2 border-gray-200 p-4
                hover:border-blue-400 transition-colors
                focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
            >
              <div className="flex items-center gap-3 mb-2">
                {g.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.image_url} alt="" className="w-10 h-10 object-contain rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-gray-900 truncate">{g.name}</p>
                  {g.barcode && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{g.barcode}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-gray-700 text-base">{g.totalQty} un.</span>
                  {g.hasExpired  && <span className="text-xs font-bold text-red-700    bg-red-100    rounded px-1.5 py-0.5">Vencido</span>}
                  {g.hasExpiring && !g.hasExpired && <span className="text-xs font-bold text-yellow-800 bg-yellow-100 rounded px-1.5 py-0.5">Vencendo</span>}
                  {g.isLowStock  && <span className="text-xs font-bold text-blue-700   bg-blue-100   rounded px-1.5 py-0.5">Acabando</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.lots.slice(0, 3).map((lot) => (
                  <div key={lot.id} className="flex items-center gap-1.5 text-sm">
                    <span className="text-gray-500">{lot.location_name}</span>
                    <span className="text-gray-300">·</span>
                    <span className="font-medium text-gray-700">{statusLabel[lot.status]}</span>
                    {lot.expiry_date && <SemaphoreBadge expiryDate={lot.expiry_date} />}
                  </div>
                ))}
                {g.lots.length > 3 && (
                  <span className="text-xs text-gray-400">+{g.lots.length - 3} lotes</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {scanning && (
        <BarcodeScanner
          onScan={(code) => { setQuery(code); setScanning(false) }}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  )
}
