'use server'

import { revalidatePath } from 'next/cache'
import { query, queryOne } from '@/lib/db'
import { fetchProductByBarcode } from '@/lib/products-api'
import type { ActionResult, Product } from '@/lib/types'

export async function lookupBarcode(barcode: string): Promise<Product | null> {
  try {
    const existing = await queryOne<Product>(
      'SELECT * FROM products WHERE barcode = $1',
      [barcode]
    )
    if (existing) return existing

    const off = await fetchProductByBarcode(barcode)
    if (!off) return null

    const created = await queryOne<Product>(
      `INSERT INTO products (barcode, name, brand, image_url, default_category)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (barcode) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [
        barcode,
        off.product_name ?? 'Produto sem nome',
        off.brands ?? null,
        off.image_url ?? null,
        off.categories ?? null,
      ]
    )
    return created
  } catch (err) {
    console.error('[products] lookupBarcode:', err)
    return null
  }
}

export async function createProduct(formData: FormData): Promise<ActionResult<Product>> {
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { ok: false, error: 'Nome obrigatório' }

  const barcode = (formData.get('barcode') as string)?.trim() || null
  const brand   = (formData.get('brand') as string)?.trim() || null

  try {
    const product = await queryOne<Product>(
      `INSERT INTO products (barcode, name, brand)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [barcode, name, brand]
    )
    if (!product) return { ok: false, error: 'Erro ao criar produto' }

    revalidatePath('/estoque')
    revalidatePath('/entrada')
    return { ok: true, data: product }
  } catch (err) {
    console.error('[products] createProduct:', err)
    return { ok: false, error: 'Erro ao criar produto' }
  }
}

export async function searchProducts(q: string): Promise<Product[]> {
  if (!q.trim()) return []
  try {
    return await query<Product>(
      `SELECT * FROM products
       WHERE name ILIKE $1 OR barcode = $2
       ORDER BY name ASC LIMIT 20`,
      [`%${q}%`, q]
    )
  } catch (err) {
    console.error('[products] searchProducts:', err)
    return []
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    return await query<Product>('SELECT * FROM products ORDER BY name ASC')
  } catch (err) {
    console.error('[products] getAllProducts:', err)
    return []
  }
}
