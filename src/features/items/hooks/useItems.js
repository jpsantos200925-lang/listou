import { useEffect, useState } from 'react'
import {
  fetchItems,
  addItem,
  toggleItem,
  removeItem,
  updateItem,
  copyItemsFromMonth,
  subscribeToItems,
  unsubscribeFromItems,
} from '../services/items.service'
import { copyPriceResultsForItems } from '@/features/prices/services/prices.service'

export function useItems(listId, month) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listId || !month) return

    let channel
    let cancelled = false

    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchItems(listId, month)
        if (cancelled) return
        setItems(data)
      } catch (err) {
        console.error('[useItems] fetchItems error', err)
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }

      channel = subscribeToItems(listId, month, {
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
  }, [listId, month])

  return {
    items,
    loading,
    addItem: ({ name, quantity, is_online_purchase = false }) =>
      addItem(listId, { name, quantity, month, is_online_purchase }),
    toggleItem,
    deleteItem: (id) => {
      setItems((prev) => prev.filter((i) => i.id !== id))
      return removeItem(id)
    },
    editItem: (id, updates) => {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...updates } : i))
      return updateItem(id, updates)
    },
    copyFromMonth: async (sourceMonth) => {
      const { items: inserted, idMap } = await copyItemsFromMonth(listId, sourceMonth, month)
      await copyPriceResultsForItems(idMap).catch((err) =>
        console.error('[useItems] copyPriceResultsForItems error', err)
      )
      return inserted
    },
  }
}
