import { getAllLotsWithDetails } from '@/lib/queries'
import EstoqueClient from './EstoqueClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Estoque — Caixinha' }

export default async function EstoquePage() {
  const lots = await getAllLotsWithDetails()
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Estoque</h1>
      <EstoqueClient lots={lots} />
    </>
  )
}
