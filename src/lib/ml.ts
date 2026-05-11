import { SimpleLinearRegression } from 'ml-regression-simple-linear'
import { query, queryOne } from './db'

interface MovementRow {
  occurred_at: string
}

export async function computeAndCachePrediction(productId: number): Promise<void> {
  try {
    const movements = await query<MovementRow>(
      `SELECT sm.occurred_at
       FROM stock_movements sm
       JOIN lots l ON l.id = sm.lot_id
       WHERE l.product_id = $1
         AND sm.type IN ('out_used', 'out_wasted')
       ORDER BY sm.occurred_at ASC`,
      [productId]
    )

    if (movements.length < 3) {
      await queryOne(
        `INSERT INTO consumption_predictions(product_id, predicted_days_to_empty, predicted_runout_at, computed_at)
         VALUES ($1, NULL, NULL, NOW())
         ON CONFLICT (product_id) DO UPDATE
           SET predicted_days_to_empty = NULL,
               predicted_runout_at = NULL,
               computed_at = NOW()`,
        [productId]
      )
      return
    }

    const t0 = new Date(movements[0].occurred_at).getTime()
    const x = movements.map((m) => (new Date(m.occurred_at).getTime() - t0) / 86_400_000)
    const y = movements.map((_, i) => i + 1)

    const regression = new SimpleLinearRegression(x, y)
    const slope = regression.slope
    if (slope <= 0) return

    const stockRow = await queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(qty), 0) AS total
       FROM lots WHERE product_id = $1 AND status != 'acabou'`,
      [productId]
    )
    const totalStock = parseInt(stockRow?.total ?? '0', 10)
    const daysToEmpty = totalStock / slope

    const runoutDate = new Date()
    runoutDate.setDate(runoutDate.getDate() + Math.round(daysToEmpty))

    await queryOne(
      `INSERT INTO consumption_predictions(product_id, predicted_days_to_empty, predicted_runout_at, computed_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (product_id) DO UPDATE
         SET predicted_days_to_empty = $2,
             predicted_runout_at = $3,
             computed_at = NOW()`,
      [productId, daysToEmpty.toFixed(1), runoutDate.toISOString().slice(0, 10)]
    )
  } catch (err) {
    console.error('[ml] computeAndCachePrediction:', err)
  }
}

// Refresh predictions for products with ≥3 movements and missing/stale data (>1h old)
export async function refreshStalePredictions(): Promise<void> {
  try {
    const rows = await query<{ product_id: number }>(
      `SELECT DISTINCT l.product_id
       FROM stock_movements sm
       JOIN lots l ON l.id = sm.lot_id
       WHERE sm.type IN ('out_used', 'out_wasted')
       GROUP BY l.product_id
       HAVING COUNT(*) >= 3
       AND l.product_id NOT IN (
         SELECT product_id FROM consumption_predictions
         WHERE computed_at > NOW() - INTERVAL '1 hour'
       )`
    )
    await Promise.all(rows.map((r) => computeAndCachePrediction(r.product_id)))
  } catch (err) {
    console.error('[ml] refreshStalePredictions:', err)
  }
}
