import { useState, useEffect } from 'react'
import type { List } from '@/types'
import { fetchListBySlug } from '../services/lists.service'

export function useListBySlug(slug: string | undefined): {
  list: List | null
  loading: boolean
  notFound: boolean
} {
  const [list, setList] = useState<List | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return

    let cancelled = false
    setLoading(true)
    setNotFound(false)

    ;(async () => {
      try {
        const data = await fetchListBySlug(slug)
        if (!cancelled) setList(data)
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [slug])

  return { list, loading, notFound }
}
