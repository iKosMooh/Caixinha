'use client'

import { useState, useTransition } from 'react'
import { testConnection, saveDatabaseUrl } from '@/app/actions/config'
import { changePin } from '@/app/actions/pin'

type Status = { type: 'idle' } | { type: 'ok'; msg: string } | { type: 'error'; msg: string }

function StatusMsg({ s }: { s: Status }) {
  if (s.type === 'idle') return null
  return (
    <p className={`text-sm font-semibold rounded-xl px-4 py-3 ${
      s.type === 'ok'
        ? 'bg-green-50 border border-green-300 text-green-800'
        : 'bg-red-50 border border-red-300 text-red-800'
    }`}>
      {s.msg}
    </p>
  )
}

/* ─────────────────────────────────────────
   Seção 1: DATABASE_URL — requer PASSWORD
───────────────────────────────────────── */
function DatabaseSection() {
  const [password, setPassword] = useState('')
  const [dbUrl, setDbUrl]       = useState('')
  const [showUrl, setShowUrl]   = useState(false)
  const [status, setStatus]     = useState<Status>({ type: 'idle' })
  const [isPending, start]      = useTransition()

  function handleTest() {
    if (!dbUrl) return
    setStatus({ type: 'idle' })
    start(async () => {
      const r = await testConnection(dbUrl)
      setStatus(r.ok
        ? { type: 'ok',    msg: 'Conexão bem-sucedida ✅' }
        : { type: 'error', msg: r.error ?? 'Falha na conexão' })
    })
  }

  function handleSave() {
    if (!password || !dbUrl) return
    setStatus({ type: 'idle' })
    start(async () => {
      const r = await saveDatabaseUrl(password, dbUrl)
      if (r.ok) {
        setStatus({ type: 'ok', msg: 'DATABASE_URL salvo e pool reiniciado ✅' })
        setPassword('')
      } else {
        setStatus({ type: 'error', msg: r.error ?? 'Erro ao salvar' })
      }
    })
  }

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 space-y-4">
      <div>
        <h2 className="text-lg font-extrabold text-gray-900">🗄️ DATABASE_URL</h2>
        <p className="text-xs text-gray-400 mt-0.5">Requer a PASSWORD do .env.local</p>
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nova URL</label>
        <div className="relative">
          <input
            type={showUrl ? 'text' : 'password'}
            value={dbUrl}
            onChange={(e) => setDbUrl(e.target.value)}
            placeholder="postgresql://user:senha@host:5432/db"
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 text-sm
              font-mono focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowUrl((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            aria-label={showUrl ? 'Ocultar' : 'Mostrar'}
          >
            {showUrl ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {/* PASSWORD */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">PASSWORD</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base
            focus:border-blue-500 focus:outline-none"
        />
      </div>

      <StatusMsg s={status} />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleTest}
          disabled={isPending || !dbUrl}
          className="flex-1 rounded-xl border-2 border-blue-500 text-blue-700 font-bold
            text-base py-3 min-h-[48px] hover:bg-blue-50 disabled:opacity-50
            disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? '…' : '🔌 Testar'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !dbUrl || !password}
          className="flex-1 rounded-xl bg-blue-600 text-white font-bold text-base py-3
            min-h-[48px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {isPending ? 'Salvando…' : '💾 Salvar'}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Seção 2: PIN — requer apenas PIN atual
───────────────────────────────────────── */
function PinSection() {
  const [pinCurrent, setPinCurrent] = useState('')
  const [pinNew, setPinNew]         = useState('')
  const [status, setStatus]         = useState<Status>({ type: 'idle' })
  const [isPending, start]          = useTransition()

  function handleSave() {
    setStatus({ type: 'idle' })
    start(async () => {
      const r = await changePin(pinCurrent, pinNew)
      if (r.ok) {
        setStatus({ type: 'ok', msg: 'PIN alterado ✅ — próxima sessão usa o novo PIN' })
        setPinCurrent('')
        setPinNew('')
        sessionStorage.removeItem('pinVerified')
      } else {
        setStatus({ type: 'error', msg: r.error ?? 'Erro ao alterar PIN' })
      }
    })
  }

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 space-y-4">
      <div>
        <h2 className="text-lg font-extrabold text-gray-900">🔐 PIN do app</h2>
        <p className="text-xs text-gray-400 mt-0.5">4 dígitos. Não requer PASSWORD.</p>
      </div>

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
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pinNew}
        onChange={(e) => setPinNew(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="Novo PIN"
        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base
          tracking-widest text-center focus:border-blue-500 focus:outline-none"
      />

      <StatusMsg s={status} />

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || pinCurrent.length !== 4 || pinNew.length !== 4}
        className="w-full rounded-xl bg-gray-800 text-white font-bold text-base py-3
          min-h-[48px] hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors"
      >
        {isPending ? 'Salvando…' : '🔐 Salvar novo PIN'}
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────
   Export
───────────────────────────────────────── */
export default function ConfigClient() {
  return (
    <div className="space-y-6">
      <DatabaseSection />
      <PinSection />
    </div>
  )
}
