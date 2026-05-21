import { getStoredPin } from '@/lib/pin'
import ConfigClient from './ConfigClient'

export const metadata = { title: 'Configurações — Caixinha' }

export default async function ConfiguracoesPage() {
  const hasPin = (await getStoredPin()) !== null

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">⚙️ Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">PIN de acesso ao app</p>
      </header>

      <ConfigClient hasPin={hasPin} />
    </>
  )
}
