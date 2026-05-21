import { Pool, type QueryResultRow } from 'pg'

// Supabase fornece POSTGRES_URL via Vercel integration ou dashboard
// Settings → Database → Connection pooling → Connection string (Transaction mode, porta 6543)
const CONNECTION_STRING = process.env.POSTGRES_URL

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined
}

export function getPool(): Pool {
  if (global.__pgPool) return global.__pgPool

  if (!CONNECTION_STRING) {
    throw new Error(
      'POSTGRES_URL não definido. Configure em Supabase → Settings → Database → Connection pooling.'
    )
  }

  global.__pgPool = new Pool({
    connectionString: CONNECTION_STRING,
    max: 3,                        // serverless: poucos por instância
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: false }, // Supabase exige SSL
  })

  global.__pgPool.on('error', (err) => {
    console.error('[pg] pool error:', err.message)
    global.__pgPool = undefined   // força recriação na próxima chamada
  })

  return global.__pgPool
}

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
      global.__pgPool = undefined  // pool corrompido → recria
      const result = await getPool().query<T>(sql, params)
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
