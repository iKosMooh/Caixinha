'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { removeLot } from '@/app/actions/lots'
import type { Product } from '@/lib/types'
import Button from '@/components/Button'
import NumericInput from '@/components/NumericInput'
import UndoToast from '@/components/UndoToast'

interface Props { products: Product[] }

export default function SaidaForm({ products }: Props) {
  const [selectedId,  setSelectedId]  = useState<number | null>(null)
  const [searchText,  setSearchText]  = useState('')
  const [showDrop,    setShowDrop]    = useState(false)
  const [qty,         setQty]         = useState('1')
  const [reason,      setReason]      = useState<'out_used' | 'out_wasted'>('out_used')
  const [error,       setError]       = useState<string | null>(null)
  const [success,     setSuccess]     = useState<{ productId: number; qty: number; reason: 'out_used' | 'out_wasted' } | null>(null)
  const [isPending,   startTransition] = useTransition()
  const wrapRef = useRef<HTMLDivElement>(null)

  const product = products.find((p) => p.id === selectedId) ?? null

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (p.barcode ?? '').includes(searchText)
  )

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectProduct(p: Product) {
    setSelectedId(p.id)
    setSearchText(p.name)
    setShowDrop(false)
  }

  function clearProduct() {
    setSelectedId(null)
    setSearchText('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) { setError('Escolha um produto'); return }
    setError(null)
    const snap = { productId: selectedId, qty: Number(qty) || 1, reason }
    startTransition(async () => {
      const res = await removeLot(snap.productId, snap.qty, snap.reason)
      if (!res.ok) { setError(res.error); return }
      setSuccess(snap)
      setSelectedId(null); setSearchText(''); setQty('1'); setReason('out_used')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Searchable product picker */}
      <section>
        <label className="block text-base font-semibold text-gray-700 mb-2">
          Produto
        </label>
        <div ref={wrapRef} className="relative">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                setSelectedId(null)
                setShowDrop(true)
              }}
              onFocus={() => setShowDrop(true)}
              placeholder="Buscar produto pelo nome ou código..."
              className="w-full min-h-[52px] rounded-xl border-2 border-gray-300 pl-10 pr-10 py-2
                text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="Buscar produto"
              aria-expanded={showDrop}
              autoComplete="off"
            />
            {searchText && (
              <button
                type="button"
                onClick={clearProduct}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                  hover:text-gray-700 text-2xl leading-none min-w-[36px] min-h-[36px]
                  flex items-center justify-center"
                aria-label="Limpar seleção"
              >
                ×
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDrop && (
            <ul
              className="absolute z-30 w-full mt-1 bg-white border-2 border-gray-200
                rounded-xl shadow-xl max-h-60 overflow-y-auto"
              role="listbox"
            >
              {filteredProducts.length === 0 ? (
                <li className="px-4 py-3 text-gray-400 text-base">Nenhum produto encontrado</li>
              ) : (
                filteredProducts.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseDown={() => selectProduct(p)}
                      className="w-full text-left px-4 py-3 text-base font-medium
                        hover:bg-blue-50 focus:bg-blue-50 focus:outline-none
                        border-b border-gray-100 last:border-0"
                      role="option"
                      aria-selected={selectedId === p.id}
                    >
                      <span className="font-bold text-gray-900">{p.name}</span>
                      {p.barcode && (
                        <span className="ml-2 text-xs text-gray-400 font-mono">{p.barcode}</span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Selected product preview */}
        {product && (
          <div className="mt-3 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
            {product.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt="" className="w-12 h-12 object-contain rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-blue-800 truncate">{product.name}</p>
              {product.brand && <p className="text-sm text-blue-600">{product.brand}</p>}
            </div>
            <span className="text-green-600 text-2xl">✓</span>
          </div>
        )}
      </section>

      <NumericInput
        label="Quantidade"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        min="1"
      />

      {/* Exit reason */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Motivo</h2>
        <div className="flex gap-3">
          {(['out_used', 'out_wasted'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={`flex-1 min-h-[64px] rounded-xl border-2 font-semibold text-base transition-colors
                focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none
                ${reason === r
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                }`}
              aria-pressed={reason === r}
            >
              {r === 'out_used' ? '✅ Usei tudo' : '🗑 Joguei fora'}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p role="alert" className="text-red-700 font-semibold bg-red-50 border border-red-300 rounded-xl p-3">
          {error}
        </p>
      )}

      <Button type="submit" variant="danger" disabled={isPending || !selectedId} className="w-full">
        {isPending ? 'Registrando...' : 'Registrar saída'}
      </Button>

      {success && (
        <UndoToast
          message={`Saída de ${success.qty} unidade(s) registrada!`}
          onUndo={async () => {
            const { addLot } = await import('@/app/actions/lots')
            const fd = new FormData()
            fd.set('product_id', String(success.productId))
            fd.set('location_id', '1')
            fd.set('qty', String(success.qty))
            await addLot(fd)
            setSuccess(null)
          }}
          onExpire={() => setSuccess(null)}
        />
      )}
    </form>
  )
}
