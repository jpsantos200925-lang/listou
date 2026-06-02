import { useEffect, useState } from 'react'
import {
  fetchExpenses,
  addExpense,
  removeExpense,
  subscribeToExpenses,
  unsubscribeFromExpenses,
} from '../services/expenses.service'

export function useExpenses(listId, month) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listId || !month) return

    let channel
    let cancelled = false

    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchExpenses(listId, month)
        if (cancelled) return
        setExpenses(data)
      } catch (err) {
        console.error('[useExpenses] fetchExpenses error', err)
        if (!cancelled) setExpenses([])
      } finally {
        if (!cancelled) setLoading(false)
      }

      // Só abre o canal se o componente ainda estiver montado
      if (cancelled) return

      channel = subscribeToExpenses(listId, month, {
        onInsert: ({ new: expense }) => setExpenses((prev) => {
          if (expense.month !== month || prev.some((e) => e.id === expense.id)) return prev
          return [expense, ...prev]
        }),
        onUpdate: ({ new: expense }) => setExpenses((prev) => {
          if (expense.month !== month) return prev
          return prev.map((e) => e.id === expense.id ? expense : e)
        }),
        onDelete: ({ old: expense }) => setExpenses((prev) =>
          prev.filter((e) => e.id !== expense.id)
        ),
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

  const total = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  return {
    expenses,
    loading,
    total,
    addExpense: ({ description, amount }) =>
      addExpense(listId, { description, amount, month }),
    deleteExpense: async (id) => {
      // Otimista: remove da UI imediatamente
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      try {
        await removeExpense(id)
      } catch (err) {
        // Rollback se o servidor rejeitar
        console.error('[useExpenses] removeExpense error', err)
        const data = await fetchExpenses(listId, month).catch(() => null)
        if (data) setExpenses(data)
        throw err
      }
    },
  }
}
