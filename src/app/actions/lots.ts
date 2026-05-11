'use server'

import { revalidatePath } from 'next/cache'
import { query, queryOne } from '@/lib/db'
import { computeAndCachePrediction } from '@/lib/ml'
import type { ActionResult, Lot, MovementType } from '@/lib/types'

export async function addLot(formData: FormData): Promise<ActionResult<Lot>> {
  const productId  = Number(formData.get('product_id'))
  const locationId = Number(formData.get('location_id'))
  const qty        = Number(formData.get('qty') ?? 1)
  const expiryRaw  = formData.get('expiry_date') as string | null
  const expiry     = expiryRaw && expiryRaw.trim() ? expiryRaw.trim() : null

  if (!productId || !locationId) {
    return { ok: false, error: 'Produto e local são obrigatórios' }
  }

  try {
    const lot = await queryOne<Lot>(
      `INSERT INTO lots (product_id, location_id, qty, expiry_date)
       VALUES ($1, $2, 0, $3) RETURNING *`,
      [productId, locationId, expiry]
    )
    if (!lot) return { ok: false, error: 'Erro ao registrar lote' }

    await queryOne(
      `INSERT INTO stock_movements (lot_id, type, qty) VALUES ($1, 'in', $2)`,
      [lot.id, qty]
    )

    revalidatePath('/')
    revalidatePath('/estoque')
    return { ok: true, data: lot }
  } catch (err) {
    console.error('[lots] addLot:', err)
    return { ok: false, error: 'Erro ao registrar lote' }
  }
}

export async function removeLot(
  productId: number,
  qty: number,
  type: 'out_used' | 'out_wasted'
): Promise<ActionResult<void>> {
  try {
    const lot = await queryOne<Lot>(
      `SELECT * FROM lots
       WHERE product_id = $1 AND status != 'acabou' AND qty > 0
       ORDER BY
         expiry_date ASC NULLS LAST,
         entered_at ASC
       LIMIT 1`,
      [productId]
    )
    if (!lot) return { ok: false, error: 'Sem estoque disponível' }

    const actualQty = Math.min(qty, lot.qty)

    await queryOne(
      `INSERT INTO stock_movements (lot_id, type, qty) VALUES ($1, $2, $3)`,
      [lot.id, type as MovementType, actualQty]
    )

    computeAndCachePrediction(productId).catch(() => {})

    revalidatePath('/')
    revalidatePath('/estoque')
    revalidatePath('/saida')
    return { ok: true, data: undefined }
  } catch (err) {
    console.error('[lots] removeLot:', err)
    return { ok: false, error: 'Erro ao registrar saída' }
  }
}

export async function adjustLot(lotId: number, newQty: number): Promise<ActionResult<void>> {
  if (newQty < 0) return { ok: false, error: 'Quantidade inválida' }

  try {
    await queryOne(
      `INSERT INTO stock_movements (lot_id, type, qty) VALUES ($1, 'adjust', $2)`,
      [lotId, newQty]
    )

    revalidatePath('/')
    revalidatePath('/estoque')
    return { ok: true, data: undefined }
  } catch (err) {
    console.error('[lots] adjustLot:', err)
    return { ok: false, error: 'Erro ao ajustar lote' }
  }
}

export async function clearLocation(locationId: number): Promise<ActionResult<void>> {
  try {
    const lots = await query<{ id: number; qty: number }>(
      `SELECT id, qty FROM lots WHERE location_id = $1 AND status != 'acabou'`,
      [locationId]
    )

    for (const lot of lots) {
      if (lot.qty > 0) {
        await queryOne(
          `INSERT INTO stock_movements (lot_id, type, qty) VALUES ($1, 'adjust', 0)`,
          [lot.id]
        )
      }
    }

    revalidatePath('/')
    revalidatePath('/estoque')
    return { ok: true, data: undefined }
  } catch (err) {
    console.error('[lots] clearLocation:', err)
    return { ok: false, error: 'Erro ao limpar local' }
  }
}

export async function getLotsForProduct(productId: number): Promise<Lot[]> {
  try {
    return await query<Lot>(
      `SELECT l.*, p.name AS product_name, p.image_url, loc.name AS location_name
       FROM lots l
       JOIN products p   ON p.id = l.product_id
       JOIN locations loc ON loc.id = l.location_id
       WHERE l.product_id = $1
       ORDER BY l.expiry_date ASC NULLS LAST, l.entered_at ASC`,
      [productId]
    )
  } catch (err) {
    console.error('[lots] getLotsForProduct:', err)
    return []
  }
}

export async function getAllLotsWithDetails(): Promise<Lot[]> {
  try {
    return await query<Lot>(
      `SELECT l.*, p.name AS product_name, p.image_url, p.barcode, loc.name AS location_name
       FROM lots l
       JOIN products p   ON p.id = l.product_id
       JOIN locations loc ON loc.id = l.location_id
       ORDER BY p.name ASC, l.expiry_date ASC NULLS LAST`
    )
  } catch (err) {
    console.error('[lots] getAllLotsWithDetails:', err)
    return []
  }
}
