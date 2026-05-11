'use client'

import { useState, useTransition } from 'react'
import {
  addShoppingItem,
  checkShoppingItem,
  removeShoppingItem,
} from '@/app/actions/shopping'
import type { ShoppingItem } from '@/lib/types'
import type { SuggestedItem } from '@/lib/types'
import Button from '@/components/Button'
import UndoToast from '@/components/UndoToast'

interface Props {
  initialItems: ShoppingItem[]
  suggestions: SuggestedItem[]
}

const reasonConfig = {
  vencido:  { label: 'Vencido',  classes: 'bg-red-100    text-red-800    border-red-300'    },
  vencendo: { label: 'Vencendo', classes: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
  acabando: { label: 'Acabando', classes: 'bg-blue-100   text-blue-800   border-blue-300'   },
}

export default function ListaClient({ initialItems, suggestions }: Props) {
  const [items,    setItems]    = useState(initialItems)
  const [newText,  setNewText]  = useState('')
  const [newQty,   setNewQty]   = useState('1')
  const [removed,  setRemoved]  = useState<ShoppingItem | null>(null)
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())
  const [isPending, startTransition] = useTransition()

  function buildWhatsAppLink(list: ShoppingItem[]): string {
    const lines = list.map((i) => `- ${i.qty}x ${i.product_name ?? i.free_text ?? 'Item'}`)
    const text = encodeURIComponent('Lista de compras:\n' + lines.join('\n'))
    return `https://wa.me/?text=${text}`
  }

  function handlePrint() {
    const content = items
      .map((i) => `[ ]  ${i.qty}x  ${i.product_name ?? i.free_text ?? 'Item'}`)
      .join('\n')
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Lista de Compras</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 18px; padding: 32px; }
        h1   { font-size: 24px; margin-bottom: 24px; }
        pre  { line-height: 2.2; white-space: pre-wrap; }
      </style></head>
      <body>
        <h1>Lista de Compras — Caixinha</h1>
        <pre>${content}</pre>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim()) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('free_text', newText)
      fd.set('qty', newQty || '1')
      const res = await addShoppingItem(fd)
      if (res.ok) {
        setItems((prev) => [...prev, res.data])
        setNewText(''); setNewQty('1')
      }
    })
  }

  function handleAddSuggestion(s: SuggestedItem) {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('product_id', String(s.product_id))
      fd.set('qty', '1')
      const res = await addShoppingItem(fd)
      if (res.ok) {
        // Enrich with product_name since INSERT doesn't JOIN
        setItems((prev) => [...prev, { ...res.data, product_name: s.name }])
        setAddedIds((prev) => new Set(prev).add(s.product_id))
      }
    })
  }

  function handleCheck(item: ShoppingItem) {
    startTransition(async () => {
      await checkShoppingItem(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    })
  }

  function handleRemove(item: ShoppingItem) {
    setRemoved(item)
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    startTransition(async () => {
      await removeShoppingItem(item.id)
    })
  }

  const visibleSuggestions = suggestions.filter((s) => !addedIds.has(s.product_id))

  return (
    <div className="space-y-6">

      {/* Suggestions */}
      {visibleSuggestions.length > 0 && (
        <section aria-label="Sugestões">
          <h2 className="text-lg font-bold text-gray-700 mb-3">💡 Sugestões para repor</h2>
          <ul className="space-y-2">
            {visibleSuggestions.map((s) => {
              const cfg = reasonConfig[s.reason]
              return (
                <li
                  key={s.product_id}
                  className={`flex items-center justify-between gap-3 rounded-xl border-2 p-3 ${cfg.classes}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base truncate">{s.name}</p>
                    <p className="text-xs font-semibold mt-0.5 opacity-75">{cfg.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSuggestion(s)}
                    disabled={isPending}
                    className="rounded-xl bg-white border-2 border-current px-4 py-2
                      font-bold text-sm min-h-[44px] hover:opacity-80 transition-opacity
                      focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none
                      disabled:opacity-50 flex-shrink-0"
                    aria-label={`Adicionar ${s.name} à lista`}
                  >
                    ➕ Adicionar
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Add item form */}
      <section aria-label="Adicionar item">
        <h2 className="text-lg font-bold text-gray-700 mb-3">Adicionar item</h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Qualquer item, ex: Sabão em pó..."
            className="flex-1 min-h-[52px] rounded-xl border-2 border-gray-300 px-4 py-2 text-lg
              focus:border-blue-500 focus:outline-none"
            aria-label="Nome do item"
          />
          <input
            type="text"
            inputMode="numeric"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            className="w-16 min-h-[52px] rounded-xl border-2 border-gray-300 px-3 py-2 text-lg
              text-center focus:border-blue-500 focus:outline-none"
            aria-label="Quantidade"
            pattern="[0-9]*"
          />
          <Button type="submit" disabled={isPending} size="lg">➕</Button>
        </form>
      </section>

      {/* List */}
      <section aria-label="Itens na lista">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-700">
            Minha lista
            {items.length > 0 && (
              <span className="ml-2 text-base font-normal text-gray-400">({items.length})</span>
            )}
          </h2>
          {items.length > 0 && (
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border-2 border-gray-300
                bg-white px-3 py-2 text-sm font-semibold text-gray-700
                hover:border-gray-500 transition-colors min-h-[44px]
                focus-visible:ring-4 focus-visible:ring-gray-400 focus-visible:outline-none"
              aria-label="Imprimir lista"
            >
              🖨 Imprimir
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8 rounded-xl bg-white border-2 border-dashed border-gray-200">
            Lista vazia. Adicione itens ou use as sugestões acima.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 bg-white rounded-xl border-2 border-gray-200 p-4"
              >
                <button
                  type="button"
                  onClick={() => handleCheck(item)}
                  className="w-8 h-8 rounded-full border-2 border-gray-400 flex-shrink-0
                    flex items-center justify-center
                    hover:border-green-500 hover:bg-green-50 transition-colors
                    focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:outline-none"
                  aria-label={`Marcar "${item.product_name ?? item.free_text}" como comprado`}
                />
                <span className="flex-1 text-lg font-medium">
                  {item.qty > 1 && <span className="text-gray-500 mr-1">{item.qty}x</span>}
                  {item.product_name ?? item.free_text}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="text-2xl text-gray-300 hover:text-red-500 transition-colors
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400
                    min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Remover item"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* WhatsApp share */}
      {items.length > 0 && (
        <a
          href={buildWhatsAppLink(items)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full min-h-[52px] rounded-xl
            bg-green-500 text-white font-bold text-lg hover:bg-green-600 transition-colors
            focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:outline-none"
        >
          📱 Compartilhar no WhatsApp
        </a>
      )}

      {removed && (
        <UndoToast
          message={`"${removed.product_name ?? removed.free_text}" removido`}
          onUndo={async () => {
            const { addShoppingItem: add } = await import('@/app/actions/shopping')
            const fd = new FormData()
            if (removed.product_id) fd.set('product_id', String(removed.product_id))
            if (removed.free_text)  fd.set('free_text', removed.free_text)
            fd.set('qty', String(removed.qty))
            const res = await add(fd)
            if (res.ok) setItems((prev) => [res.data, ...prev])
            setRemoved(null)
          }}
          onExpire={() => setRemoved(null)}
        />
      )}
    </div>
  )
}
