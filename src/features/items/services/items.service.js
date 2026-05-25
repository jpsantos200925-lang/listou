import { supabase } from '@/shared/services/supabaseClient'

export async function fetchItems(month) {
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('month', month)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function addItem(month, name, quantity) {
  await supabase.from('items').insert({ month, name, quantity })
}

export async function toggleItem(id, checked) {
  await supabase.from('items').update({ checked }).eq('id', id)
}

export async function deleteItem(id) {
  await supabase.from('items').delete().eq('id', id)
}

export async function copyFromMonth(targetMonth, sourceMonth) {
  const { data: sourceItems } = await supabase
    .from('items')
    .select('name, quantity')
    .eq('month', sourceMonth)

  if (!sourceItems?.length) return

  const newItems = sourceItems.map((item) => ({
    month: targetMonth,
    name: item.name,
    quantity: item.quantity,
    checked: false,
  }))

  await supabase.from('items').insert(newItems)
}

export function subscribeToItems(month, { onInsert, onUpdate, onDelete, onStatus }) {
  return supabase
    .channel(`items:${month}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'items', filter: `month=eq.${month}` }, onInsert)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'items', filter: `month=eq.${month}` }, onUpdate)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'items', filter: `month=eq.${month}` }, onDelete)
    .subscribe(onStatus)
}

export function unsubscribeFromItems(channel) {
  return supabase.removeChannel(channel)
}
