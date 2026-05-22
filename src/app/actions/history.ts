import 'server-only'

import { query, queryOne } from '@/lib/db'
import type { Product } from '@/lib/types'

export interface MovementRow {
  movement_id:   number
  movement_type: 'in' | 'out_used' | 'out_wasted' | 'adjust'
  movement_qty:  number
  occurred_at:   string
  note:          string | null
  lot_id:        number
  lot_status:    string
  expiry_date:   string | null
  entered_at:    string
  opened_at:     string | null
  finished_at:   string | null
  location_name: string
  location_kind: string
}

export async function getProductHistory(productId: number): Promise<MovementRow[]> {
  return query<MovementRow>(
    `SELECT
       sm.id           AS movement_id,
       sm.type         AS movement_type,
       sm.qty          AS movement_qty,
       sm.occurred_at,
       sm.note,
       l.id            AS lot_id,
       l.status        AS lot_status,
       l.expiry_date,
       l.entered_at,
       l.opened_at,
       l.finished_at,
       loc.name        AS location_name,
       loc.kind        AS location_kind
     FROM stock_movements sm
     JOIN lots     l   ON l.id   = sm.lot_id
     JOIN locations loc ON loc.id = l.location_id
     WHERE l.product_id = $1
     ORDER BY sm.occurred_at DESC`,
    [productId]
  )
}

export async function getProductById(productId: number): Promise<Product | null> {
  return queryOne<Product>('SELECT * FROM products WHERE id = $1', [productId])
}
