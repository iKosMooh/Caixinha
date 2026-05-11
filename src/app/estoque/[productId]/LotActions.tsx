'use client'

import { useState, useTransition } from 'react'
import { adjustLot } from '@/app/actions/lots'
import UndoToast from '@/components/UndoToast'
import Button from '@/components/Button'

interface Props { lotId: number; currentQty: number }

export default function LotActions({ lotId, currentQty }: Props) {
  const [editing, setEditing] = useState(false)
  const [newQty, setNewQty]   = useState(String(currentQty))
  const [success, setSuccess] = useState(false)
  const [prevQty, setPrevQty] = useState(currentQty)
  const [isPending, startTransition] = useTransition()

  function handleAdjust() {
    const qty = Math.max(0, parseInt(newQty) || 0)
    setPrevQty(currentQty)
    startTransition(async () => {
      await adjustLot(lotId, qty)
      setEditing(false)
      setSuccess(true)
    })
  }

  return (
    <div className="mt-3">
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            className="w-20 min-h-[44px] rounded-lg border-2 border-gray-300 px-3 text-lg
              focus:border-blue-500 focus:outline-none text-center"
            aria-label="Nova quantidade"
          />
          <Button size="md" onClick={handleAdjust} disabled={isPending}>
            {isPending ? '...' : 'Salvar'}
          </Button>
          <Button size="md" variant="ghost" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          Zerar / corrigir qtd
        </Button>
      )}

      {success && (
        <UndoToast
          message="Quantidade ajustada!"
          onUndo={async () => {
            await adjustLot(lotId, prevQty)
            setSuccess(false)
          }}
          onExpire={() => setSuccess(false)}
        />
      )}
    </div>
  )
}
