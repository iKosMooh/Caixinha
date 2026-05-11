import { getLotsForProduct } from '@/lib/queries'
import { queryOne } from '@/lib/db'
import type { Product } from '@/lib/types'
import SemaphoreBadge from '@/components/SemaphoreBadge'
import LotActions from './LotActions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Detalhe — Caixinha' }

const statusLabel: Record<string, string> = {
  fechado: 'Fechado',
  aberto:  'Aberto',
  acabou:  'Acabou',
}

interface Props { params: Promise<{ productId: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = await params
  const [product, lots] = await Promise.all([
    queryOne<Product>('SELECT * FROM products WHERE id = $1', [productId]),
    getLotsForProduct(Number(productId)),
  ])

  if (!product) {
    return <p className="text-red-600 p-4">Produto não encontrado.</p>
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        {product.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt="" className="w-14 h-14 object-contain rounded-xl" />
        )}
        <h1 className="text-2xl font-bold">{product.name}</h1>
      </div>

      {lots.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhum lote registrado.</p>
      ) : (
        <ul className="space-y-3">
          {lots.map((lot) => (
            <li key={lot.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">{lot.location_name}</span>
                <SemaphoreBadge expiryDate={lot.expiry_date} />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Status: <strong>{statusLabel[lot.status]}</strong></span>
                <span>Qtd: <strong>{lot.qty}</strong></span>
              </div>
              <LotActions lotId={lot.id} currentQty={lot.qty} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
