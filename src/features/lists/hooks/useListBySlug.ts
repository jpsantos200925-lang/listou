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
    setLoading(true)
    setNotFound(false)
    fetchListBySlug(slug)
      .then(setList)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  return { list, loading, notFound }
}
