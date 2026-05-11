import 'server-only'

import { query, queryOne } from '@/lib/db'
import type { Lot, ConsumptionPrediction } from '@/lib/types'

export interface StockSummary {
  total_products: number
  total_units: number
}

export async function getExpiringSoon(): Promise<Lot[]> {
  try {
    return await query<Lot>('SELECT * FROM v_expiring_soon')
  } catch (err) {
    console.error('[dashboard] getExpiringSoon:', err)
    return []
  }
}

export async function getExpired(): Promise<Lot[]> {
  try {
    return await query<Lot>('SELECT * FROM v_expired')
  } catch (err) {
    console.error('[dashboard] getExpired:', err)
    return []
  }
}

export async function getLowStock(): Promise<{ product_id: number; name: string; image_url: string | null; total_qty: number }[]> {
  try {
    return await query('SELECT * FROM v_low_stock')
  } catch (err) {
    console.error('[dashboard] getLowStock:', err)
    return []
  }
}

export async function getStockSummary(): Promise<StockSummary> {
  try {
    const row = await queryOne<{ total_products: string; total_units: string }>(
      `SELECT COUNT(DISTINCT product_id)::text AS total_products,
              COALESCE(SUM(qty), 0)::text       AS total_units
       FROM lots WHERE status != 'acabou'`
    )
    return {
      total_products: parseInt(row?.total_products ?? '0', 10),
      total_units:    parseInt(row?.total_units    ?? '0', 10),
    }
  } catch (err) {
    console.error('[dashboard] getStockSummary:', err)
    return { total_products: 0, total_units: 0 }
  }
}

export async function getPredictions(): Promise<ConsumptionPrediction[]> {
  try {
    return await query<ConsumptionPrediction>(
      `SELECT cp.*, p.name AS product_name
       FROM consumption_predictions cp
       JOIN products p ON p.id = cp.product_id
       WHERE cp.predicted_runout_at IS NOT NULL
       ORDER BY cp.predicted_runout_at ASC
       LIMIT 10`
    )
  } catch (err) {
    console.error('[dashboard] getPredictions:', err)
    return []
  }
}
