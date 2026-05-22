import { getLotsForProduct } from '@/lib/queries'
import { queryOne } from '@/lib/db'
import { getProductHistory } from '@/app/actions/history'
import type { Product } from '@/lib/types'
import SemaphoreBadge from '@/components/SemaphoreBadge'
import BackButton from '@/components/BackButton'
import LotActions from './LotActions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Detalhe — Caixinha' }

const statusLabel: Record<string, string> = {
  fechado: 'Fechado',
  aberto:  'Aberto',
  acabou:  'Acabou',
}

const TYPE_LABEL: Record<string, string> = {
  in:         'Entrada',
  out_used:   'Uso',
  out_wasted: 'Desperdício',
  adjust:     'Ajuste',
}
const TYPE_ICON: Record<string, string> = {
  in:         '➕',
  out_used:   '✅',
  out_wasted: '🗑️',
  adjust:     '🔧',
}
const TYPE_BADGE: Record<string, string> = {
  in:         'bg-green-100  text-green-800',
  out_used:   'bg-blue-100   text-blue-800',
  out_wasted: 'bg-red-100    text-red-800',
  adjust:     'bg-yellow-100 text-yellow-800',
}
const TYPE_BORDER: Record<string, string> = {
  in:         'border-green-200',
  out_used:   'border-blue-200',
  out_wasted: 'border-red-200',
  adjust:     'border-yellow-200',
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}
function fmtDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface Props { params: Promise<{ productId: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = await params
  const id = Number(productId)

  const [product, lots, movements] = await Promise.all([
    queryOne<Product>('SELECT * FROM products WHERE id = $1', [id]),
    getLotsForProduct(id),
    getProductHistory(id),
  ])

  if (!product) {
    return <p className="text-red-600 p-4">Produto não encontrado.</p>
  }

  return (
    <>
      <BackButton label="Estoque" fallbackHref="/estoque" />

      {/* Produto header */}
      <div className="flex items-center gap-3 mb-6">
        {product.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt="" className="w-14 h-14 object-contain rounded-xl" />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{product.name}</h1>
          {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
          {product.barcode && (
            <p className="text-xs text-gray-400 font-mono mt-0.5">EAN: {product.barcode}</p>
          )}
        </div>
      </div>

      {/* Lotes */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Lotes em estoque
        </h2>

        {lots.length === 0 ? (
          <p className="text-gray-500 text-center py-6 bg-white rounded-2xl border border-gray-200">
            Nenhum lote registrado.
          </p>
        ) : (
          <ul className="space-y-3">
            {lots.map((lot) => (
              <li key={lot.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">{lot.location_name}</span>
                  <SemaphoreBadge expiryDate={lot.expiry_date} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-1">
                  <span>Status: <strong>{statusLabel[lot.status]}</strong></span>
                  <span>Qtd: <strong>{lot.qty}</strong></span>
                  {lot.expiry_date && (
                    <span>Validade: <strong>{fmtDate(lot.expiry_date)}</strong></span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  Entrada: {fmtDateTime(lot.entered_at)}
                  {lot.opened_at  && ` · Aberto: ${fmtDateTime(lot.opened_at)}`}
                  {lot.finished_at && ` · Finalizado: ${fmtDateTime(lot.finished_at)}`}
                </p>
                <LotActions lotId={lot.id} currentQty={lot.qty} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Histórico de movimentos */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Histórico de movimentos
        </h2>

        {movements.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-200">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm text-gray-400 font-semibold">Nenhum movimento registrado</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {movements.map((m) => (
              <li
                key={m.movement_id}
                className={`bg-white rounded-2xl border-2 ${TYPE_BORDER[m.movement_type]} p-4`}
              >
                {/* Linha principal */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1
                    text-xs font-bold ${TYPE_BADGE[m.movement_type]}`}>
                    {TYPE_ICON[m.movement_type]} {TYPE_LABEL[m.movement_type]}
                  </span>
                  <div className="text-right">
                    <p className="text-xl font-extrabold leading-none text-gray-900">
                      {m.movement_type === 'adjust'
                        ? `→ ${m.movement_qty}`
                        : m.movement_type.startsWith('out')
                          ? `- ${m.movement_qty}`
                          : `+ ${m.movement_qty}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(m.occurred_at)}</p>
                  </div>
                </div>

                {/* Nota */}
                {m.note && (
                  <p className="text-sm italic text-gray-600 mb-2">💬 {m.note}</p>
                )}

                {/* Detalhes do lote */}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                  <span>📍 {m.location_name}</span>
                  <span>Lote #{m.lot_id} · {statusLabel[m.lot_status] ?? m.lot_status}</span>
                  {m.expiry_date && <span>Val: {fmtDate(m.expiry_date)}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
