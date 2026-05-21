'use server'

import { getStoredPin, setStoredPin } from '@/lib/pin'

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await getStoredPin()
  if (!stored) return true       // sem PIN configurado = sempre passa
  return pin === stored
}

export async function changePin(
  currentPin: string,
  newPin: string
): Promise<{ ok: boolean; error?: string }> {
  if (!/^\d{4}$/.test(newPin))
    return { ok: false, error: 'Novo PIN deve ter exatamente 4 dígitos' }

  const stored = await getStoredPin()

  // Se já existe PIN, exige o atual
  if (stored !== null && currentPin !== stored)
    return { ok: false, error: 'PIN atual incorreto' }

  try {
    await setStoredPin(newPin)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
