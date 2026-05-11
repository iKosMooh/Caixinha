import type { OFFProduct } from './types'

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product'

// Fetch product info from Open Food Facts.
// Uses Next.js fetch cache with a 24h TTL — product data rarely changes.
export async function fetchProductByBarcode(barcode: string): Promise<OFFProduct | null> {
  try {
    const res = await fetch(`${OFF_BASE}/${barcode}.json`, {
      next: { revalidate: 86400 }, // 24h cache
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.status !== 1) return null
    return json.product as OFFProduct
  } catch {
    return null
  }
}
