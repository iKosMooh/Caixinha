import 'server-only'

import { query } from '@/lib/db'
import type { Lot, Product, ShoppingItem } from '@/lib/types'

export async function getShoppingList(): Promise<ShoppingItem[]> {
  try {
    return await query<ShoppingItem>(
      `SELECT sl.*, p.name AS product_name
       FROM shopping_list sl
       LEFT JOIN products p ON p.id = sl.product_id
       WHERE sl.checked_at IS NULL
       ORDER BY sl.created_at ASC`
    )
  } catch (err) {
    console.error('[queries] getShoppingList:', err)
    return []
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    return await query<Product>('SELECT * FROM products ORDER BY name ASC')
  } catch (err) {
    console.error('[queries] getAllProducts:', err)
    return []
  }
}

export async function getAllLotsWithDetails(): Promise<Lot[]> {
  try {
    return await query<Lot>(
      `SELECT l.*, p.name AS product_name, p.image_url, p.barcode, loc.name AS location_name
       FROM lots l
       JOIN products p    ON p.id = l.product_id
       JOIN locations loc ON loc.id = l.location_id
       ORDER BY p.name ASC, l.expiry_date ASC NULLS LAST`
    )
  } catch (err) {
    console.error('[queries] getAllLotsWithDetails:', err)
    return []
  }
}

export async function getLotsForProduct(productId: number): Promise<Lot[]> {
  try {
    return await query<Lot>(
      `SELECT l.*, p.name AS product_name, p.image_url, loc.name AS location_name
       FROM lots l
       JOIN products p    ON p.id = l.product_id
       JOIN locations loc ON loc.id = l.location_id
       WHERE l.product_id = $1
       ORDER BY l.expiry_date ASC NULLS LAST, l.entered_at ASC`,
      [productId]
    )
  } catch (err) {
    console.error('[queries] getLotsForProduct:', err)
    return []
  }
}
