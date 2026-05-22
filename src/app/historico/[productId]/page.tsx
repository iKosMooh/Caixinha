import { notFound } from 'next/navigation'
import { getProductHistory, getProductById } from '@/app/actions/history'
import BackButton from '@/components/BackButton'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ productId: string }> }

/* ── Labels ─────────────────────────────────────── */
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
const TYPE_COLOR: Record<string, string> = {
  in:         'bg-green-50  border-green-300  text-green-900',
  out_used:   'bg-blue-50   border-blue-300   text-blue-900',
  out_wasted: 'bg-red-50    border-red-300    text-red-900',
  adjust:     'bg-yellow-50 border-yellow-300 text-yellow-900',
}
const TYPE_BADGE: Record<string, string> = {
  in:         'bg-green-100  text-green-800',
  out_used:   'bg-blue-100   text-blue-800',
  out_wasted: 'bg-red-100    text-red-800',
  adjust:     'bg-yellow-100 text-yellow-800',
}
const STATUS_LABEL: Record<string, string> = {
  fechado: 'Fechado',
  aberto:  'Aberto',
  acabou:  'Acabou',
}

function fmt(iso: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', year: 'numeric',
    ...opts,
  })
}
function fmtFull(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/* ── Page ───────────────────────────────────────── */
export default async function HistoricoPage({ params }: Props) {
  const { productId } = await params
  const id = Number(productId)

  const [product, movements] = await Promise.all([
    getProductById(id),
    getProductHistory(id),
  ])

  if (!product) notFound()

  /* group by date (YYYY-MM-DD in BR timezone) */
  const grouped = movements.reduce<Record<string, typeof movements>>((acc, m) => {
    const day = new Date(m.occurred_at).toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
    if (!acc[day]) acc[day] = []
    acc[day].push(m)
    return acc
  }, {})

  const totals = {
    in:         movements.filter((m) => m.movement_type === 'in').reduce((s, m) => s + m.movement_qty, 0),
    out_used:   movements.filter((m) => m.movement_type === 'out_used').reduce((s, m) => s + m.movement_qty, 0),
    out_wasted: movements.filter((m) => m.movement_type === 'out_wasted').reduce((s, m) => s + m.movement_qty, 0),
    adjust:     movements.filter((m) => m.movement_type === 'adjust').length,
  }

  return (
    <>
      <BackButton label="Detalhe" fallbackHref={`/estoque/${productId}`} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        {product.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt="" className="w-12 h-12 object-contain rounded-xl" />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-gray-900 truncate">{product.name}</h1>
          {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
        </div>
      </div>

      {product.barcode && (
        <p className="text-xs text-gray-400 mb-5 font-mono">EAN: {product.barcode}</p>
      )}

      {/* Totals strip */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { key: 'in',         label: 'Entradas',     icon: '➕', color: 'bg-green-50  border-green-200 text-green-800' },
          { key: 'out_used',   label: 'Usos',          icon: '✅', color: 'bg-blue-50   border-blue-200  text-blue-800'  },
          { key: 'out_wasted', label: 'Desperdiços',   icon: '🗑️', color: 'bg-red-50    border-red-200   text-red-800'   },
          { key: 'adjust',     label: 'Ajustes',       icon: '🔧', color: 'bg-yellow-50 border-yellow-200 text-yellow-800'},
        ].map(({ key, label, icon, color }) => (
          <div key={key} className={`rounded-xl border-2 p-2 text-center ${color}`}>
            <p className="text-lg">{icon}</p>
            <p className="text-lg font-extrabold leading-none">
              {totals[key as keyof typeof totals]}
            </p>
            <p className="text-[10px] font-semibold mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {movements.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold">Nenhum movimento registrado</p>
        </div>
      )}

      {/* Timeline grouped by day */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, dayMovements]) => (
          <section key={day}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 capitalize">
              {day}
            </h2>

            <ul className="space-y-3">
              {dayMovements.map((m) => (
                <li
                  key={m.movement_id}
                  className={`rounded-2xl border-2 p-4 ${TYPE_COLOR[m.movement_type]}`}
                >
                  {/* Row 1: type + qty + time */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1
                      text-sm font-bold ${TYPE_BADGE[m.movement_type]}`}>
                      {TYPE_ICON[m.movement_type]} {TYPE_LABEL[m.movement_type]}
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold leading-none">
                        {m.movement_type === 'adjust' ? '→' : m.movement_type.startsWith('out') ? '-' : '+'}{m.movement_qty}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(m.occurred_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Note */}
                  {m.note && (
                    <p className="text-sm italic mb-3 opacity-80">💬 {m.note}</p>
                  )}

                  {/* Lot details */}
                  <div className="rounded-xl bg-white/60 p-3 space-y-1.5 text-sm">
                    <p className="font-bold text-gray-700 text-xs uppercase tracking-wide mb-1">
                      Lote #{m.lot_id}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
                      <span className="text-gray-400">Local</span>
                      <span className="font-semibold">{m.location_name}</span>

                      <span className="text-gray-400">Status lote</span>
                      <span className="font-semibold">{STATUS_LABEL[m.lot_status] ?? m.lot_status}</span>

                      <span className="text-gray-400">Validade</span>
                      <span className="font-semibold">
                        {m.expiry_date ? fmt(m.expiry_date) : 'Sem validade'}
                      </span>

                      <span className="text-gray-400">Entrada</span>
                      <span className="font-semibold">{fmtFull(m.entered_at)}</span>

                      {m.opened_at && (
                        <>
                          <span className="text-gray-400">Aberto em</span>
                          <span className="font-semibold">{fmtFull(m.opened_at)}</span>
                        </>
                      )}

                      {m.finished_at && (
                        <>
                          <span className="text-gray-400">Finalizado em</span>
                          <span className="font-semibold">{fmtFull(m.finished_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
