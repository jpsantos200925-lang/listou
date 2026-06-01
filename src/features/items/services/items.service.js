import { supabase } from '@/shared/services/supabaseClient'

export async function fetchItems(listId, month) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('list_id', listId)
    .eq('month', month)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addItem(listId, { name, quantity, month }) {
  const { data, error } = await supabase
    .from('items')
    .insert({ list_id: listId, name, quantity, month })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleItem(id, checked) {
  const { data, error } = await supabase
    .from('items')
    .update({ checked })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeItem(id) {
  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) throw error
}

export async function updateItem(id, { name, quantity }) {
  const { data, error } = await supabase
    .from('items')
    .update({ name, quantity })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchMonthsForList(listId) {
  const { data, error } = await supabase
    .from('items')
    .select('month')
    .eq('list_id', listId)
    .order('month', { ascending: false })
  if (error) throw error
  const unique = [...new Set(data.map(d => d.month))]
  return unique
}

export async function copyItemsFromMonth(listId, fromMonth, toMonth) {
  const { data, error } = await supabase
    .from('items')
    .select('name, quantity')
    .eq('list_id', listId)
    .eq('month', fromMonth)
  if (error) throw error
  const inserts = data.map(({ name, quantity }) => ({
    list_id: listId,
    name,
    quantity,
    month: toMonth,
    checked: false,
  }))
  const { data: inserted, error: insertError } = await supabase
    .from('items')
    .insert(inserts)
    .select()
  if (insertError) throw insertError
  return inserted
}

export function subscribeToItems(listId, month, { onInsert, onUpdate, onDelete, onStatus }) {
  return supabase
    .channel(`items:${listId}:${month}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` }, onInsert)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` }, onUpdate)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` }, onDelete)
    .subscribe(onStatus)
}

export function unsubscribeFromItems(channel) {
  return supabase.removeChannel(channel)
}
