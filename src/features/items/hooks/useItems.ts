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
import { toast } from '@/shared/components/Toast'

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
        if (!cancelled) {
          setItems([])
          toast.error('Não foi possível carregar os itens')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }

      if (cancelled) return

      channel = subscribeToItems(listId, month, {
        onInsert: item =>
          setItems(prev => (prev.some(i => i.id === item.id) ? prev : [item, ...prev])),
        onUpdate: item => setItems(prev => prev.map(i => (i.id === item.id ? item : i))),
        onDelete: item => setItems(prev => prev.filter(i => i.id !== item.id)),
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
    addItem: async ({ name, quantity, is_online_purchase = false }: AddItemPayload) => {
      try {
        return await addItem(listId!, { name, quantity, month, is_online_purchase })
      } catch (err) {
        console.error('[useItems] addItem error', err)
        toast.error('Erro ao adicionar o item')
        throw err
      }
    },
    toggleItem,
    deleteItem: async (id: string) => {
      setItems(prev => prev.filter(i => i.id !== id))
      try {
        await removeItem(id)
      } catch (err) {
        console.error('[useItems] removeItem error', err)
        toast.error('Erro ao remover o item')
        const data = await fetchItems(listId!, month).catch(() => null)
        if (data) setItems(data)
      }
    },
    editItem: async (
      id: string,
      updates: Partial<Pick<Item, 'name' | 'quantity' | 'is_online_purchase'>>
    ) => {
      const snapshot = items.find(i => i.id === id)
      setItems(prev => prev.map(i => (i.id === id ? { ...i, ...updates } : i)))
      try {
        return await updateItem(id, updates)
      } catch (err) {
        console.error('[useItems] updateItem error', err)
        toast.error('Erro ao salvar a alteração')
        if (snapshot) setItems(prev => prev.map(i => (i.id === id ? snapshot : i)))
        throw err
      }
    },
    copyFromMonth: async (sourceMonth: string) => {
      const { items: inserted, idMap } = await copyItemsFromMonth(listId!, sourceMonth, month)
      // Falha silenciosa — copiar preços é side effect não-crítico,
      // não deve bloquear a cópia dos itens.
      await copyPriceResultsForItems(idMap).catch(err =>
        console.error('[useItems] copyPriceResultsForItems error', err)
      )
      return inserted
    },
  }
}
