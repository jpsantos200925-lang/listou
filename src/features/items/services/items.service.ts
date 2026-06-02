import { supabase } from '@/shared/services/supabaseClient'
import type { Item } from '@/types'
import type { Database } from '@/types/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type ItemRow = Database['public']['Tables']['items']['Row']

export interface ItemCallbacks {
  onInsert: (item: ItemRow) => void
  onUpdate: (item: ItemRow) => void
  onDelete: (item: Partial<ItemRow>) => void
  onStatus: (status: string, err?: Error) => void
}

export async function fetchItems(listId: string, month: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('list_id', listId)
    .eq('month', month)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addItem(
  listId: string,
  payload: { name: string; quantity: string; month: string; is_online_purchase?: boolean }
): Promise<Item> {
  const { name, quantity, month, is_online_purchase = false } = payload
  const { data, error } = await supabase
    .from('items')
    .insert({ list_id: listId, name, quantity, month, is_online_purchase })
    .select()
    .single()
  if (error) throw error
  return data!
}

export async function toggleItem(id: string, checked: boolean): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update({ checked })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data!
}

export async function removeItem(id: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) throw error
}

export async function updateItem(
  id: string,
  updates: Partial<Pick<Item, 'name' | 'quantity' | 'is_online_purchase'>>
): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data!
}

export async function copyItemsFromMonth(
  listId: string,
  fromMonth: string,
  toMonth: string
): Promise<{ items: Item[]; idMap: Map<string, string> }> {
  const { data: sources, error } = await supabase
    .from('items')
    .select('id, name, quantity, is_online_purchase')
    .eq('list_id', listId)
    .eq('month', fromMonth)
    .order('created_at', { ascending: true })
  if (error) throw error

  // Insere um a um para garantir o mapeamento old→new sem depender
  // da ordem de retorno do banco em inserções em lote.
  const inserted: Item[] = []
  const idMap = new Map<string, string>()
  for (const src of sources ?? []) {
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
    inserted.push(newItem!)
    idMap.set(src.id, newItem!.id)
  }

  return { items: inserted, idMap }
}

export function subscribeToItems(
  listId: string,
  month: string,
  callbacks: ItemCallbacks
): RealtimeChannel {
  return supabase
    .channel(`items:${listId}:${month}`)
    .on<ItemRow>(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
      payload => callbacks.onInsert(payload.new as ItemRow)
    )
    .on<ItemRow>(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
      payload => callbacks.onUpdate(payload.new as ItemRow)
    )
    .on<ItemRow>(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
      payload => callbacks.onDelete(payload.old as Partial<ItemRow>)
    )
    .subscribe(callbacks.onStatus)
}

export function unsubscribeFromItems(channel: RealtimeChannel) {
  return supabase.removeChannel(channel)
}
