'use client'

import { useState, useTransition } from 'react'
import { changePin } from '@/app/actions/pin'

type Status = { type: 'idle' } | { type: 'ok'; msg: string } | { type: 'error'; msg: string }

interface Props {
  hasPin: boolean
}

export default function ConfigClient({ hasPin: initialHasPin }: Props) {
  const [hasPin, setHasPin]     = useState(initialHasPin)
  const [pinCurrent, setPinCurrent] = useState('')
  const [pinNew, setPinNew]         = useState('')
  const [status, setStatus]         = useState<Status>({ type: 'idle' })
  const [isPending, start]          = useTransition()

  function handleSave() {
    setStatus({ type: 'idle' })
    start(async () => {
      const r = await changePin(pinCurrent, pinNew)
      if (r.ok) {
        setStatus({ type: 'ok', msg: hasPin ? 'PIN alterado ✅' : 'PIN definido ✅' })
        setHasPin(true)
        setPinCurrent('')
        setPinNew('')
        sessionStorage.removeItem('pinVerified')
      } else {
        setStatus({ type: 'error', msg: r.error ?? 'Erro ao salvar PIN' })
      }
    })
  }

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 space-y-5">
      <div>
        <h2 className="text-lg font-extrabold text-gray-900">🔐 PIN do app</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {hasPin ? 'Informe o PIN atual para definir um novo.' : 'Nenhum PIN configurado. Defina um PIN de 4 dígitos.'}
        </p>
      </div>

      {/* PIN atual — só mostra se já existe PIN */}
      {hasPin && (
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pinCurrent}
          onChange={(e) => setPinCurrent(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="PIN atual"
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base
            tracking-widest text-center focus:border-blue-500 focus:outline-none"
        />
      )}

      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pinNew}
        onChange={(e) => setPinNew(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="Novo PIN (4 dígitos)"
        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base
          tracking-widest text-center focus:border-blue-500 focus:outline-none"
      />

      {status.type !== 'idle' && (
        <p className={`text-sm font-semibold rounded-xl px-4 py-3 ${
          status.type === 'ok'
            ? 'bg-green-50 border border-green-300 text-green-800'
            : 'bg-red-50 border border-red-300 text-red-800'
        }`}>
          {status.msg}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || pinNew.length !== 4 || (hasPin && pinCurrent.length !== 4)}
        className="w-full rounded-xl bg-blue-600 text-white font-bold text-base py-3
          min-h-[48px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors"
      >
        {isPending ? 'Salvando…' : hasPin ? '🔐 Alterar PIN' : '🔐 Definir PIN'}
      </button>
    </div>
  )
}
