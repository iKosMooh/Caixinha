'use server'

import { Pool } from 'pg'
import { getEffectiveDatabaseUrl, saveRuntimeConfig } from '@/lib/config'
import { resetPool } from '@/lib/db'

export async function verifyPassword(password: string): Promise<boolean> {
  const expected = process.env.PASSWORD
  if (!expected) return false
  return password === expected
}

export async function getCurrentDatabaseUrl(): Promise<string> {
  return getEffectiveDatabaseUrl()
}

export async function testConnection(
  url: string
): Promise<{ ok: boolean; error?: string }> {
  const testPool = new Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 5_000,
  })
  try {
    const client = await testPool.connect()
    await client.query('SELECT 1')
    client.release()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  } finally {
    await testPool.end().catch(() => {})
  }
}

export async function saveDatabaseUrl(
  password: string,
  url: string
): Promise<{ ok: boolean; error?: string }> {
  const valid = await verifyPassword(password)
  if (!valid) return { ok: false, error: 'Senha incorreta' }

  const test = await testConnection(url)
  if (!test.ok) return { ok: false, error: `Conexão falhou: ${test.error}` }

  saveRuntimeConfig({ databaseUrl: url })
  await resetPool()

  return { ok: true }
}
