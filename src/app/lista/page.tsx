import { getShoppingList } from '@/lib/queries'
import { getExpired, getExpiringSoon, getLowStock } from '../actions/dashboard'
import { getAllProducts } from '../actions/products'
import ListaClient from './ListaClient'
import type { ShoppingItem, SuggestedItem } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Lista de Compras — Caixinha' }

export default async function ListaPage() {
  const [items, expired, expiring, lowStock, products] = await Promise.all([
    getShoppingList(),
    getExpired(),
    getExpiringSoon(),
    getLowStock(),
    getAllProducts(),
  ])

  const inListIds = new Set(
    (items as ShoppingItem[]).map((i) => i.product_id).filter(Boolean)
  )

  const seen = new Set<number>()
  const suggestions: SuggestedItem[] = []

  for (const lot of expired) {
    if (lot.product_id && !inListIds.has(lot.product_id) && !seen.has(lot.product_id)) {
      seen.add(lot.product_id)
      suggestions.push({ product_id: lot.product_id, name: lot.product_name ?? `Produto #${lot.product_id}`, reason: 'vencido' })
    }
  }
  for (const lot of expiring) {
    if (lot.product_id && !inListIds.has(lot.product_id) && !seen.has(lot.product_id)) {
      seen.add(lot.product_id)
      suggestions.push({ product_id: lot.product_id, name: lot.product_name ?? `Produto #${lot.product_id}`, reason: 'vencendo' })
    }
  }
  for (const item of lowStock) {
    if (!inListIds.has(item.product_id) && !seen.has(item.product_id)) {
      seen.add(item.product_id)
      suggestions.push({ product_id: item.product_id, name: item.name, reason: 'acabando' })
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Lista de Compras</h1>
      <ListaClient initialItems={items} suggestions={suggestions} products={products} />
    </>
  )
}
