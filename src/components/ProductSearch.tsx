'use client'

import { useState, useTransition } from 'react'
import { searchProducts } from '@/app/actions/products'
import type { Product } from '@/lib/types'

interface ProductSearchProps {
  onSelect: (product: Product) => void
  placeholder?: string
}

export default function ProductSearch({ onSelect, placeholder = 'Buscar produto...' }: ProductSearchProps) {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isPending, startTransition] = useTransition()

  function handleChange(val: string) {
    setQuery(val)
    if (val.length < 2) { setResults([]); return }
    startTransition(async () => {
      const products = await searchProducts(val)
      setResults(products)
    })
  }

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[52px] rounded-xl border-2 border-gray-300 px-4 py-2 text-lg
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-label="Buscar produto"
        aria-autocomplete="list"
        aria-controls="product-search-results"
      />
      {isPending && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          Buscando...
        </span>
      )}
      {results.length > 0 && (
        <ul
          id="product-search-results"
          role="listbox"
          className="absolute z-20 mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto"
        >
          {results.map((p) => (
            <li key={p.id} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => { onSelect(p); setQuery(p.name); setResults([]) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50
                  focus-visible:bg-blue-50 focus-visible:outline-none text-base"
              >
                {p.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt="" className="w-10 h-10 object-contain rounded" />
                )}
                <span>
                  <span className="font-semibold">{p.name}</span>
                  {p.brand && <span className="text-gray-500 text-sm ml-2">{p.brand}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
