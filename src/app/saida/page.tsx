import { getAllProducts } from '@/lib/queries'
import SaidaForm from './SaidaForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Saída — Caixinha' }

export default async function SaidaPage() {
  const products = await getAllProducts()
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Registrar Saída</h1>
      <SaidaForm products={products} />
    </>
  )
}
