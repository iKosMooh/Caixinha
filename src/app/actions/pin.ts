'use server'

import { getEffectivePin, getRuntimeConfig, saveRuntimeConfig } from '@/lib/config'

export async function hasPinConfigured(): Promise<boolean> {
  return getEffectivePin() !== null
}

export async function verifyPin(pin: string): Promise<boolean> {
  const expected = getEffectivePin()
  if (!expected) return true // sem PIN = sempre passa
  return pin === expected
}

export async function changePin(
  currentPin: string,
  newPin: string
): Promise<{ ok: boolean; error?: string }> {
  const valid = await verifyPin(currentPin)
  if (!valid) return { ok: false, error: 'PIN atual incorreto' }
  if (!/^\d{4}$/.test(newPin)) return { ok: false, error: 'Novo PIN deve ter exatamente 4 dígitos' }

  const config = getRuntimeConfig()
  saveRuntimeConfig({ ...config, pin: newPin })
  return { ok: true }
}
