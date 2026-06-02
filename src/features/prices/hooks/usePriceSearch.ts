import { useEffect, useState } from 'react'
import type { PriceResult } from '@/types'
import { fetchPriceResults, triggerPriceSearch } from '../services/prices.service'

export function usePriceSearch(itemId: string, itemName: string) {
  const [results, setResults] = useState<PriceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!itemId) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchPriceResults(itemId)
        if (!cancelled) setResults(data)
      } catch (err) {
        console.error('[usePriceSearch] fetchPriceResults error', err)
        if (!cancelled) setError((err as Error).message)
      } finally {
        if (!cancelled) setInitialLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [itemId])

  async function search() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const data = await triggerPriceSearch(itemId, itemName)
      setResults(data)
    } catch (err) {
      console.error('[usePriceSearch] triggerPriceSearch error', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, initialLoading, error, search }
}
