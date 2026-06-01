import { supabase } from '@/shared/services/supabaseClient'

export async function fetchExpenses(listId, month) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('list_id', listId)
    .eq('month', month)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addExpense(listId, { description, amount, month }) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ list_id: listId, description: description || null, amount, month })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

export function subscribeToExpenses(listId, month, { onInsert, onUpdate, onDelete, onStatus }) {
  return supabase
    .channel(`expenses:${listId}:${month}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'expenses', filter: `list_id=eq.${listId}` }, onInsert)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'expenses', filter: `list_id=eq.${listId}` }, onUpdate)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'expenses', filter: `list_id=eq.${listId}` }, onDelete)
    .subscribe(onStatus)
}

export function unsubscribeFromExpenses(channel) {
  return supabase.removeChannel(channel)
}
