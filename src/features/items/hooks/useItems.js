import { useEffect, useState } from 'react'
import {
  fetchItems,
  addItem,
  toggleItem,
  deleteItem,
  copyFromMonth,
  subscribeToItems,
  unsubscribeFromItems,
} from '../services/items.service'

export function useItems(month) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!month) return

    let channel
    let cancelled = false

    ;(async () => {
      setLoading(true)
      const data = await fetchItems(month)
      if (cancelled) return
      setItems(data)
      setLoading(false)

      channel = subscribeToItems(month, {
        onInsert: ({ new: item }) => setItems((prev) => {
          if (prev.find((i) => i.id === item.id)) return prev
          return [item, ...prev]
        }),
        onUpdate: ({ new: item }) => setItems((prev) => prev.map((i) => i.id === item.id ? item : i)),
        onDelete: ({ old: item }) => setItems((prev) => prev.filter((i) => i.id !== item.id)),
        onStatus: (status, err) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('[useItems] realtime status', status, err)
          }
        },
      })
    })()

    return () => {
      cancelled = true
      if (channel) unsubscribeFromItems(channel)
    }
  }, [month])

  return {
    items,
    loading,
    addItem: ({ name, quantity }) => addItem(month, name, quantity),
    toggleItem,
    deleteItem: (id) => {
      setItems((prev) => prev.filter((i) => i.id !== id))
      return deleteItem(id)
    },
    copyFromMonth: (sourceMonth) => copyFromMonth(month, sourceMonth),
  }
}
