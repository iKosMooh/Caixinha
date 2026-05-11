// Shared domain types — mirrors DB schema

export type LocationKind = 'armario' | 'geladeira' | 'congelador' | 'despensa' | 'outro'
export type LotStatus = 'fechado' | 'aberto' | 'acabou'
export type MovementType = 'in' | 'out_used' | 'out_wasted' | 'adjust'

export interface Product {
  id: number
  barcode: string | null
  name: string
  brand: string | null
  image_url: string | null
  default_category: string | null
  created_at: string
}

export interface Location {
  id: number
  name: string
  kind: LocationKind
}

export interface Lot {
  id: number
  product_id: number
  location_id: number
  qty: number
  status: LotStatus
  expiry_date: string | null
  entered_at: string
  opened_at: string | null
  finished_at: string | null
  // joined fields
  product_name?: string
  image_url?: string
  location_name?: string
  barcode?: string | null
}

export interface StockMovement {
  id: number
  lot_id: number
  type: MovementType
  qty: number
  occurred_at: string
  note: string | null
}

export interface ShoppingItem {
  id: number
  product_id: number | null
  free_text: string | null
  qty: number
  created_at: string
  checked_at: string | null
  // joined
  product_name?: string
}

export interface ConsumptionPrediction {
  product_id: number
  predicted_days_to_empty: number | null
  predicted_runout_at: string | null
  computed_at: string
}

// Open Food Facts API response shape (minimal)
export interface OFFProduct {
  product_name?: string
  brands?: string
  image_url?: string
  categories?: string
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export interface SuggestedItem {
  product_id: number
  name: string
  reason: 'vencido' | 'vencendo' | 'acabando'
}
