import { useEffect, useState } from 'react'
import type { Expense } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  fetchExpenses,
  addExpense,
  removeExpense,
  subscribeToExpenses,
  unsubscribeFromExpenses,
} from '../services/expenses.service'
import { toast } from '@/shared/components/Toast'

export function useExpenses(listId: string, month: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listId || !month) return

    let channel: RealtimeChannel | undefined
    let cancelled = false

    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchExpenses(listId, month)
        if (cancelled) return
        setExpenses(data)
      } catch (err) {
        console.error('[useExpenses] fetchExpenses error', err)
        if (!cancelled) {
          setExpenses([])
          toast.error('Não foi possível carregar os gastos')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }

      if (cancelled) return

      channel = subscribeToExpenses(listId, month, {
        onInsert: expense =>
          setExpenses(prev => {
            if (expense.month !== month || prev.some(e => e.id === expense.id)) return prev
            return [expense, ...prev]
          }),
        onUpdate: expense =>
          setExpenses(prev => {
            if (expense.month !== month) return prev
            return prev.map(e => (e.id === expense.id ? expense : e))
          }),
        onDelete: expense =>
          setExpenses(prev => prev.filter(e => e.id !== expense.id)),
        onStatus: (status, err) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('[useExpenses] realtime status', status, err)
          }
        },
      })
    })()

    return () => {
      cancelled = true
      if (channel) unsubscribeFromExpenses(channel)
    }
  }, [listId, month])

  const total = expenses.reduce((sum, e) => sum + (parseFloat(String(e.amount)) || 0), 0)

  return {
    expenses,
    loading,
    total,
    addExpense: async (payload: { description: string | null; amount: number }) => {
      try {
        return await addExpense(listId, { ...payload, month })
      } catch (err) {
        console.error('[useExpenses] addExpense error', err)
        toast.error('Erro ao adicionar o gasto')
        throw err
      }
    },
    deleteExpense: async (id: string) => {
      setExpenses(prev => prev.filter(e => e.id !== id))
      try {
        await removeExpense(id)
      } catch (err) {
        console.error('[useExpenses] removeExpense error', err)
        toast.error('Erro ao remover o gasto')
        const data = await fetchExpenses(listId, month).catch(() => null)
        if (data) setExpenses(data)
      }
    },
  }
}
