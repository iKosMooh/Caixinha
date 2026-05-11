'use client'

import { useState, useTransition, useRef } from 'react'
import dynamic from 'next/dynamic'
import { lookupBarcode, createProduct } from '@/app/actions/products'
import { addLot } from '@/app/actions/lots'
import type { Product, Location } from '@/lib/types'
import Button from '@/components/Button'
import LocationPicker from '@/components/LocationPicker'
import NumericInput from '@/components/NumericInput'
import UndoToast from '@/components/UndoToast'

// Dynamic import — camera API not available server-side
const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), { ssr: false })

interface Props { locations: Location[] }

export default function EntradaForm({ locations }: Props) {
  const [product, setProduct]       = useState<Product | null>(null)
  const [locationId, setLocationId] = useState<number | null>(null)
  const [qty, setQty]               = useState('1')
  const [expiry, setExpiry]         = useState('')
  const [scanning, setScanning]     = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualBarcode, setManualBarcode] = useState('')
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)
  const [lastLotId, setLastLotId]   = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  async function handleBarcode(code: string) {
    setScanning(false)
    setError(null)
    const found = await lookupBarcode(code)
    if (found) {
      setProduct(found)
    } else {
      setManualBarcode(code)
      setError('Produto não encontrado. Preencha o nome manualmente.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!locationId) { setError('Escolha um local'); return }

    startTransition(async () => {
      let prod = product

      // Create product on-the-fly if only name provided
      if (!prod) {
        if (!manualName.trim()) { setError('Informe o produto'); return }
        const fd = new FormData()
        fd.set('name', manualName)
        fd.set('barcode', manualBarcode)
        const res = await createProduct(fd)
        if (!res.ok) { setError(res.error); return }
        prod = res.data
      }

      const fd = new FormData()
      fd.set('product_id', String(prod!.id))
      fd.set('location_id', String(locationId))
      fd.set('qty', qty || '1')
      if (expiry) fd.set('expiry_date', expiry)

      const res = await addLot(fd)
      if (!res.ok) { setError(res.error); return }

      setLastLotId(res.data.id)
      setSuccess(true)
      // reset
      setProduct(null); setManualName(''); setManualBarcode('');
      setQty('1'); setExpiry(''); setLocationId(null)
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Barcode / product selection */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Produto</h2>

        <div className="flex gap-3 mb-3">
          <Button type="button" variant="ghost" onClick={() => setScanning(true)} className="flex-1">
            📷 Ler código de barras
          </Button>
        </div>

        {product ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-xl p-3">
            {product.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt="" className="w-12 h-12 object-contain rounded" />
            )}
            <div>
              <p className="font-bold text-green-800">{product.name}</p>
              {product.brand && <p className="text-sm text-green-700">{product.brand}</p>}
            </div>
            <button
              type="button"
              onClick={() => setProduct(null)}
              className="ml-auto text-gray-400 hover:text-gray-700 text-2xl leading-none
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-500"
              aria-label="Remover produto selecionado"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">
                Nome do produto
              </label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Ex: Feijão carioca"
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-300 px-4 py-2 text-lg
                  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">
                Código de barras (opcional)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="000000000000"
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-300 px-4 py-2 text-lg
                  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        )}
      </section>

      {/* Location */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Local</h2>
        <LocationPicker locations={locations} selected={locationId} onSelect={setLocationId} />
      </section>

      {/* Quantity */}
      <section>
        <NumericInput
          label="Quantidade"
          name="qty"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          min="1"
        />
      </section>

      {/* Expiry date */}
      <section>
        <label className="block text-base font-semibold text-gray-700 mb-1">
          Validade (opcional)
        </label>
        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="w-full min-h-[52px] rounded-xl border-2 border-gray-300 px-4 py-2 text-lg
            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </section>

      {error && (
        <p role="alert" className="text-red-700 font-semibold bg-red-50 border border-red-300 rounded-xl p-3">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Salvando...' : 'Registrar entrada'}
      </Button>

      {scanning && (
        <BarcodeScanner onScan={handleBarcode} onClose={() => setScanning(false)} />
      )}

      {success && lastLotId && (
        <UndoToast
          message="Entrada registrada!"
          onUndo={async () => {
            // Undo by zeroing the lot
            const { adjustLot } = await import('@/app/actions/lots')
            await adjustLot(lastLotId, 0)
            setSuccess(false)
          }}
          onExpire={() => setSuccess(false)}
        />
      )}
    </form>
  )
}
