import { Pool, type QueryResultRow } from 'pg'
import { getEffectiveDatabaseUrl } from '@/lib/config'

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined
}

export function getPool(): Pool {
  if (global.__pgPool) return global.__pgPool

  const url = getEffectiveDatabaseUrl()
  if (!url) throw new Error('DATABASE_URL não configurado. Acesse /configuracoes para definir.')

  global.__pgPool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 60_000,
    connectionTimeoutMillis: 5_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  })

  global.__pgPool.on('error', (err) => {
    console.error('[pg] pool error:', err.message)
  })

  return global.__pgPool
}

/** Encerra o pool atual e força recriação na próxima chamada */
export async function resetPool(): Promise<void> {
  if (global.__pgPool) {
    await global.__pgPool.end().catch(() => {})
    global.__pgPool = undefined
  }
}

const RETRYABLE = ['Connection closed', 'ECONNRESET', 'ECONNREFUSED', 'Connection terminated']

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  return RETRYABLE.some((msg) => err.message.includes(msg))
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool()
  try {
    const result = await pool.query<T>(sql, params)
    return result.rows
  } catch (err) {
    if (isRetryable(err)) {
      console.warn('[pg] retrying after:', (err as Error).message)
      const result = await pool.query<T>(sql, params)
      return result.rows
    }
    throw err
  }
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
