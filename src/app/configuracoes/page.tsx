import ConfigClient from './ConfigClient'

export const metadata = { title: 'Configurações — Caixinha' }

export default function ConfiguracoesPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">⚙️ Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Acesso restrito por senha</p>
      </header>

      <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
        <ConfigClient />
      </div>
    </>
  )
}
