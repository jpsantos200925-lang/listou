import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useItems(month) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!month) return

    // Busca inicial
    fetchItems()

    // Inscrição em tempo real — atualiza estado diretamente sem refetch
    const channel = supabase
      .channel(`items:${month}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'items', filter: `month=eq.${month}` },
        ({ new: item }) => setItems((prev) => {
          if (prev.find((i) => i.id === item.id)) return prev
          return [...prev, item]
        })
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'items', filter: `month=eq.${month}` },
        ({ new: item }) => setItems((prev) => prev.map((i) => i.id === item.id ? item : i))
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'items', filter: `month=eq.${month}` },
        ({ old: item }) => setItems((prev) => prev.filter((i) => i.id !== item.id))
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [month])

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('month', month)
      .order('created_at', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  async function addItem({ name, quantity }) {
    await supabase.from('items').insert({ month, name, quantity })
  }

  async function toggleItem(id, checked) {
    await supabase.from('items').update({ checked }).eq('id', id)
  }

  async function deleteItem(id) {
    await supabase.from('items').delete().eq('id', id)
  }

  async function copyFromMonth(sourceMonth) {
    const { data: sourceItems } = await supabase
      .from('items')
      .select('name, quantity')
      .eq('month', sourceMonth)

    if (!sourceItems?.length) return

    const newItems = sourceItems.map((item) => ({
      month,
      name: item.name,
      quantity: item.quantity,
      checked: false,
    }))

    await supabase.from('items').insert(newItems)
  }

  return { items, loading, addItem, toggleItem, deleteItem, copyFromMonth }
}
