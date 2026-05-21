import fs from 'fs'
import path from 'path'

const CONFIG_PATH = path.join(process.cwd(), 'config', 'runtime.json')

interface RuntimeConfig {
  databaseUrl?: string
  pin?: string
}

export function getRuntimeConfig(): RuntimeConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) as RuntimeConfig
    }
  } catch {
    // config not found or malformed → fallback to env
  }
  return {}
}

export function saveRuntimeConfig(config: RuntimeConfig): void {
  const dir = path.dirname(CONFIG_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

/** DATABASE_URL efetivo: runtime.json > env var */
export function getEffectiveDatabaseUrl(): string {
  const runtime = getRuntimeConfig()
  return runtime.databaseUrl ?? process.env.DATABASE_URL ?? ''
}

/** PIN efetivo: runtime.json > env var PIN. null = sem PIN configurado */
export function getEffectivePin(): string | null {
  const runtime = getRuntimeConfig()
  return runtime.pin ?? process.env.PIN ?? null
}
