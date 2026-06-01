import { useEffect, useState } from 'react'
import { fetchPriceResults, triggerPriceSearch } from '../services/prices.service'

export function usePriceSearch(itemId, itemName) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    if (!itemId) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchPriceResults(itemId)
        if (!cancelled) setResults(data)
      } catch (err) {
        console.error('[usePriceSearch] fetchPriceResults error', err)
      } finally {
        if (!cancelled) setInitialLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [itemId])

  async function search() {
    if (loading) return
    setLoading(true)
    try {
      const data = await triggerPriceSearch(itemId, itemName)
      setResults(data)
    } catch (err) {
      console.error('[usePriceSearch] triggerPriceSearch error', err)
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, initialLoading, search }
}
