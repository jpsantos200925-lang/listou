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

export async function addItem(listId, { name, quantity, month, is_online_purchase = false }) {
  const { data, error } = await supabase
    .from('items')
    .insert({ list_id: listId, name, quantity, month, is_online_purchase })
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

export async function updateItem(id, updates) {
  const { name, quantity, is_online_purchase } = updates
  const patch = { name, quantity }
  if (is_online_purchase !== undefined) patch.is_online_purchase = is_online_purchase
  const { data, error } = await supabase
    .from('items')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function copyItemsFromMonth(listId, fromMonth, toMonth) {
  const { data: sources, error } = await supabase
    .from('items')
    .select('id, name, quantity, is_online_purchase')
    .eq('list_id', listId)
    .eq('month', fromMonth)
    .order('created_at', { ascending: true })
  if (error) throw error

  // Insere os itens um a um para garantir o mapeamento old→new sem depender
  // da ordem de retorno do banco em inserções em lote.
  const inserted = []
  const idMap = new Map()
  for (const src of sources) {
    const { data: newItem, error: insertError } = await supabase
      .from('items')
      .insert({
        list_id: listId,
        name: src.name,
        quantity: src.quantity,
        month: toMonth,
        checked: false,
        is_online_purchase: src.is_online_purchase ?? false,
      })
      .select()
      .single()
    if (insertError) throw insertError
    inserted.push(newItem)
    idMap.set(src.id, newItem.id)
  }

  return { items: inserted, idMap }
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
