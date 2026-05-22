'use client'
import Link from 'next/link'

export default function Error() {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">⚠️</p>
      <p className="font-bold text-gray-800 mb-2">Erro ao carregar histórico</p>
      <Link href="/estoque" className="text-blue-600 text-sm underline">
        Voltar ao estoque
      </Link>
    </div>
  )
}
