import 'server-only'
import { query, queryOne } from './db'

const ENSURE_TABLE = `
  CREATE TABLE IF NOT EXISTS app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`

/** Retorna o PIN armazenado ou null se não configurado */
export async function getStoredPin(): Promise<string | null> {
  try {
    await query(ENSURE_TABLE)
    const row = await queryOne<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = 'pin'`
    )
    return row?.value ?? null
  } catch {
    return null
  }
}

/** Salva ou atualiza o PIN no banco */
export async function setStoredPin(pin: string): Promise<void> {
  await query(ENSURE_TABLE)
  await query(
    `INSERT INTO app_settings(key, value) VALUES('pin', $1)
     ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value`,
    [pin]
  )
}
