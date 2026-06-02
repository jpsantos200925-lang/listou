import { supabase } from '@/shared/services/supabaseClient'
import type { Expense } from '@/types'
import type { Database } from '@/types/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type ExpenseRow = Database['public']['Tables']['expenses']['Row']

export interface ExpenseCallbacks {
  onInsert: (expense: ExpenseRow) => void
  onUpdate: (expense: ExpenseRow) => void
  onDelete: (expense: Partial<ExpenseRow>) => void
  onStatus: (status: string, err?: Error) => void
}

export async function fetchExpenses(listId: string, month: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('list_id', listId)
    .eq('month', month)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addExpense(
  listId: string,
  payload: { description: string | null; amount: number; month: string }
): Promise<Expense> {
  const { description, amount, month } = payload
  const { data, error } = await supabase
    .from('expenses')
    .insert({ list_id: listId, description: description || null, amount, month })
    .select()
    .single()
  if (error) throw error
  return data!
}

export async function removeExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

export function subscribeToExpenses(
  listId: string,
  month: string,
  callbacks: ExpenseCallbacks
): RealtimeChannel {
  return supabase
    .channel(`expenses:${listId}:${month}`)
    .on<ExpenseRow>(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'expenses', filter: `list_id=eq.${listId}` },
      payload => callbacks.onInsert(payload.new as ExpenseRow)
    )
    .on<ExpenseRow>(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'expenses', filter: `list_id=eq.${listId}` },
      payload => callbacks.onUpdate(payload.new as ExpenseRow)
    )
    .on<ExpenseRow>(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'expenses', filter: `list_id=eq.${listId}` },
      payload => callbacks.onDelete(payload.old as Partial<ExpenseRow>)
    )
    .subscribe(callbacks.onStatus)
}

export function unsubscribeFromExpenses(channel: RealtimeChannel) {
  return supabase.removeChannel(channel)
}
