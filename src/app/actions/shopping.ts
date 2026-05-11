'use server'

import { revalidatePath } from 'next/cache'
import { query, queryOne } from '@/lib/db'
import type { ActionResult, ShoppingItem } from '@/lib/types'

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
    console.error('[shopping] getShoppingList:', err)
    return []
  }
}

export async function addShoppingItem(formData: FormData): Promise<ActionResult<ShoppingItem>> {
  const productId = formData.get('product_id') ? Number(formData.get('product_id')) : null
  const freeText  = (formData.get('free_text') as string)?.trim() || null
  const qty       = Number(formData.get('qty') ?? 1)

  if (!productId && !freeText) {
    return { ok: false, error: 'Informe um produto ou descrição' }
  }

  try {
    const item = await queryOne<ShoppingItem>(
      `INSERT INTO shopping_list (product_id, free_text, qty) VALUES ($1, $2, $3) RETURNING *`,
      [productId, freeText, qty]
    )
    if (!item) return { ok: false, error: 'Erro ao adicionar item' }

    revalidatePath('/lista')
    return { ok: true, data: item }
  } catch (err) {
    console.error('[shopping] addShoppingItem:', err)
    return { ok: false, error: 'Erro ao adicionar item' }
  }
}

export async function checkShoppingItem(id: number): Promise<ActionResult<void>> {
  try {
    await queryOne(
      `UPDATE shopping_list SET checked_at = NOW() WHERE id = $1`,
      [id]
    )
    revalidatePath('/lista')
    return { ok: true, data: undefined }
  } catch (err) {
    console.error('[shopping] checkShoppingItem:', err)
    return { ok: false, error: 'Erro ao marcar item' }
  }
}

export async function uncheckShoppingItem(id: number): Promise<ActionResult<void>> {
  try {
    await queryOne(
      `UPDATE shopping_list SET checked_at = NULL WHERE id = $1`,
      [id]
    )
    revalidatePath('/lista')
    return { ok: true, data: undefined }
  } catch (err) {
    console.error('[shopping] uncheckShoppingItem:', err)
    return { ok: false, error: 'Erro ao desmarcar item' }
  }
}

export async function removeShoppingItem(id: number): Promise<ActionResult<void>> {
  try {
    await queryOne(`DELETE FROM shopping_list WHERE id = $1`, [id])
    revalidatePath('/lista')
    return { ok: true, data: undefined }
  } catch (err) {
    console.error('[shopping] removeShoppingItem:', err)
    return { ok: false, error: 'Erro ao remover item' }
  }
}

export async function autoGenerateLowStockItems(): Promise<ActionResult<void>> {
  try {
    await queryOne(`
      INSERT INTO shopping_list (product_id, qty)
      SELECT v.product_id, 1
      FROM v_low_stock v
      WHERE NOT EXISTS (
        SELECT 1 FROM shopping_list sl
        WHERE sl.product_id = v.product_id AND sl.checked_at IS NULL
      )
    `)
    revalidatePath('/lista')
    return { ok: true, data: undefined }
  } catch (err) {
    console.error('[shopping] autoGenerateLowStockItems:', err)
    return { ok: false, error: 'Erro ao gerar lista automática' }
  }
}
