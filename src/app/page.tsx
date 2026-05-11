import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  getExpiringSoon,
  getExpired,
  getLowStock,
  getPredictions,
  getStockSummary,
} from './actions/dashboard'
import { refreshStalePredictions } from '@/lib/ml'
import SemaphoreBadge from '@/components/SemaphoreBadge'
import type { Lot, ConsumptionPrediction } from '@/lib/types'
import type { StockSummary } from './actions/dashboard'

export const dynamic = 'force-dynamic'

function QuickAction({ href, icon, label, color }: {
  href: string; icon: string; label: string; color: string
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2
        min-h-[88px] px-3 py-4 font-bold text-base transition-colors
        focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none
        ${color}`}
    >
      <span className="text-4xl" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

function SummaryStrip({ summary }: { summary: StockSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-blue-50 border-2 border-blue-200 p-4 text-center">
        <p className="text-3xl font-extrabold text-blue-800">{summary.total_products}</p>
        <p className="text-sm font-semibold text-blue-700 mt-1">Produtos</p>
      </div>
      <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4 text-center">
        <p className="text-3xl font-extrabold text-green-800">{summary.total_units}</p>
        <p className="text-sm font-semibold text-green-700 mt-1">Unidades</p>
      </div>
    </div>
  )
}

function LotRow({ lot }: { lot: Lot }) {
  return (
    <li className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 border border-gray-100">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-base truncate">{lot.product_name}</p>
        {lot.location_name && (
          <p className="text-sm text-gray-500 mt-0.5">{lot.location_name}</p>
        )}
      </div>
      <SemaphoreBadge expiryDate={lot.expiry_date} />
    </li>
  )
}

function AlertSection({
  title, icon, count, variant, children,
}: {
  title: string; icon: string; count: number
  variant: 'danger' | 'warning' | 'info' | 'purple'
  children: ReactNode
}) {
  if (count === 0) return null

  const styles: Record<string, string> = {
    danger:  'border-red-400    bg-red-50',
    warning: 'border-yellow-400 bg-yellow-50',
    info:    'border-blue-400   bg-blue-50',
    purple:  'border-purple-400 bg-purple-50',
  }
  const titleStyles: Record<string, string> = {
    danger:  'text-red-900',
    warning: 'text-yellow-900',
    info:    'text-blue-900',
    purple:  'text-purple-900',
  }

  return (
    <section className={`rounded-2xl border-2 p-4 ${styles[variant]}`} aria-label={title}>
      <header className="flex items-center gap-2 mb-4">
        <span className="text-3xl" aria-hidden="true">{icon}</span>
        <h2 className={`text-xl font-extrabold ${titleStyles[variant]}`}>
          {title}
          <span className="ml-2 text-base font-semibold opacity-70">({count})</span>
        </h2>
      </header>
      {children}
    </section>
  )
}

function PredictionCard({ p }: { p: ConsumptionPrediction & { product_name?: string } }) {
  const days = p.predicted_days_to_empty !== null
    ? Math.round(Number(p.predicted_days_to_empty))
    : null

  const urgency =
    days === null ? 'bg-gray-50 border-gray-200 text-gray-700' :
    days <= 5     ? 'bg-red-50 border-red-300 text-red-900'    :
    days <= 14    ? 'bg-yellow-50 border-yellow-300 text-yellow-900' :
                    'bg-green-50 border-green-300 text-green-900'

  const daysLabel =
    days === null ? 'Sem previsão'    :
    days <= 0     ? 'Acabando agora!' :
    days === 1    ? 'Acaba amanhã'    :
                    `Acaba em ${days} dias`

  return (
    <li className={`flex items-center justify-between gap-3 rounded-xl border-2 p-3 ${urgency}`}>
      <p className="font-bold text-base flex-1 min-w-0 truncate">
        {p.product_name ?? `Produto #${p.product_id}`}
      </p>
      <span className="text-sm font-semibold whitespace-nowrap">{daysLabel}</span>
    </li>
  )
}

function LowStockRow({ item }: {
  item: { product_id: number; name: string; image_url: string | null; total_qty: number }
}) {
  return (
    <li className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 border border-gray-100">
      <p className="font-bold text-gray-900 text-base flex-1 min-w-0 truncate">{item.name}</p>
      <span className="rounded-lg bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1 text-sm font-bold whitespace-nowrap">
        {item.total_qty} un.
      </span>
    </li>
  )
}

function AllClear() {
  return (
    <div className="rounded-2xl bg-green-50 border-2 border-green-300 p-6 text-center">
      <p className="text-5xl mb-3" aria-hidden="true">✅</p>
      <p className="text-xl font-extrabold text-green-800">Tudo em dia!</p>
      <p className="text-green-700 mt-1 text-base">Nenhum alerta no momento.</p>
    </div>
  )
}

export default async function HomePage() {
  await refreshStalePredictions()

  const [expiring, expired, lowStock, predictions, summary] = await Promise.all([
    getExpiringSoon(),
    getExpired(),
    getLowStock(),
    getPredictions(),
    getStockSummary(),
  ])

  const hasAlerts = expired.length > 0 || expiring.length > 0 ||
    lowStock.length > 0 || predictions.length > 0

  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Caixinha</h1>
      <p className="text-gray-500 text-base mb-6">Controle da sua despensa</p>

      <div className="space-y-5">
        <SummaryStrip summary={summary} />

        <section aria-label="Ações rápidas">
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-3">
            O que deseja fazer?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction href="/entrada" icon="➕" label="Entrada"
              color="bg-green-50 border-green-400 text-green-900 hover:bg-green-100" />
            <QuickAction href="/saida" icon="➖" label="Saída"
              color="bg-orange-50 border-orange-400 text-orange-900 hover:bg-orange-100" />
            <QuickAction href="/lista" icon="🛒" label="Lista"
              color="bg-blue-50 border-blue-400 text-blue-900 hover:bg-blue-100" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <QuickAction href="/estoque" icon="📦" label="Estoque"
              color="bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100" />
            <QuickAction href="/estoque" icon="📷" label="Consultar"
              color="bg-purple-50 border-purple-400 text-purple-900 hover:bg-purple-100" />
          </div>
        </section>

        {!hasAlerts && <AllClear />}

        <AlertSection title="Vencidos" icon="⛔" count={expired.length} variant="danger">
          <ul className="space-y-2">
            {expired.map((lot) => <LotRow key={lot.id} lot={lot} />)}
          </ul>
          <p className="mt-3 text-sm text-red-800 font-semibold">
            Verifique e descarte os itens vencidos para evitar contaminação.
          </p>
        </AlertSection>

        <AlertSection title="Vencendo em breve" icon="⏰" count={expiring.length} variant="warning">
          <ul className="space-y-2">
            {expiring.map((lot) => <LotRow key={lot.id} lot={lot} />)}
          </ul>
          <p className="mt-3 text-sm text-yellow-800 font-semibold">
            Use esses produtos primeiro para não desperdiçar.
          </p>
        </AlertSection>

        <AlertSection title="Acabando — repor logo" icon="📉" count={lowStock.length} variant="info">
          <ul className="space-y-2">
            {lowStock.map((item) => <LowStockRow key={item.product_id} item={item} />)}
          </ul>
          <Link
            href="/lista"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600
              text-white font-bold text-base py-3 min-h-[48px]
              hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            🛒 Adicionar à lista de compras
          </Link>
        </AlertSection>

        <AlertSection title="Previsão de consumo (IA)" icon="🤖"
          count={predictions.length} variant="purple"
        >
          <p className="text-sm text-purple-800 mb-3">
            Baseado no histórico de uso, estimativa de quando cada produto vai acabar.
          </p>
          <ul className="space-y-2">
            {predictions.map((p) => (
              <PredictionCard
                key={p.product_id}
                p={p as ConsumptionPrediction & { product_name?: string }}
              />
            ))}
          </ul>
        </AlertSection>
      </div>
    </>
  )
}
