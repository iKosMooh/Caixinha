import { query } from '@/lib/db'
import type { Location } from '@/lib/types'
import EntradaForm from './EntradaForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Entrada — Caixinha' }

export default async function EntradaPage() {
  const locations = await query<Location>('SELECT * FROM locations ORDER BY id ASC')

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Registrar Entrada</h1>
      <EntradaForm locations={locations} />
    </>
  )
}
