import { useEffect, useState } from 'react'
import type { Item } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'
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

interface AddItemPayload {
  name: string
  quantity: string
  is_online_purchase?: boolean
}

export function useItems(listId: string | undefined, month: string) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listId || !month) return

    let channel: RealtimeChannel | undefined
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

      // Só abre o canal se o componente ainda estiver montado
      if (cancelled) return

      channel = subscribeToItems(listId, month, {
        onInsert: ({ new: item }) =>
          setItems(prev => (prev.some(i => i.id === item.id) ? prev : [item, ...prev])),
        onUpdate: ({ new: item }) =>
          setItems(prev => prev.map(i => (i.id === item.id ? item : i))),
        onDelete: ({ old: item }) =>
          setItems(prev => prev.filter(i => i.id !== item.id)),
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
    addItem: ({ name, quantity, is_online_purchase = false }: AddItemPayload) =>
      addItem(listId!, { name, quantity, month, is_online_purchase }),
    toggleItem,
    deleteItem: async (id: string) => {
      // Otimista: remove da UI imediatamente
      setItems(prev => prev.filter(i => i.id !== id))
      try {
        await removeItem(id)
      } catch (err) {
        // Rollback se o servidor rejeitar
        console.error('[useItems] removeItem error', err)
        const data = await fetchItems(listId!, month).catch(() => null)
        if (data) setItems(data)
        throw err
      }
    },
    editItem: (id: string, updates: Partial<Pick<Item, 'name' | 'quantity' | 'is_online_purchase'>>) => {
      setItems(prev => prev.map(i => (i.id === id ? { ...i, ...updates } : i)))
      return updateItem(id, updates)
    },
    copyFromMonth: async (sourceMonth: string) => {
      const { items: inserted, idMap } = await copyItemsFromMonth(listId!, sourceMonth, month)
      await copyPriceResultsForItems(idMap).catch(err =>
        console.error('[useItems] copyPriceResultsForItems error', err)
      )
      return inserted
    },
  }
}
