import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useExpenses } from '../hooks/useExpenses'
import { TrashIcon } from '@/shared/components/Icons'
import { formatCurrency, formatShortDate } from '@/shared/utils/formatters'
import { sheetInputCls } from '@/shared/styles/inputs'
import { expenseSchema, type ExpenseFormData } from '@/schemas/expense.schema'

function formatAmountDisplay(digits: string): string {
  if (!digits) return ''
  return (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

interface ExpenseSectionProps {
  listId: string
  month: string
}

export default function ExpenseSection({ listId, month }: ExpenseSectionProps) {
  const { expenses, loading, total, addExpense, deleteExpense } = useExpenses(listId, month)
  const [listOpen, setListOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [amountDigits, setAmountDigits] = useState('')
  const amountRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { description: '', amount: 0 },
  })

  useEffect(() => {
    if (!formOpen) {
      setAmountDigits('')
      reset()
      return
    }
    setTimeout(() => amountRef.current?.focus(), 80)
  }, [formOpen, reset])

  useEffect(() => {
    if (!formOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFormOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [formOpen])

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').replace(/^0+/, '') || ''
    setAmountDigits(digits)
    const parsed = parseInt(digits || '0', 10) / 100
    setValue('amount', parsed, { shouldValidate: true })
  }

  async function onSubmit(data: ExpenseFormData) {
    await addExpense({ description: data.description?.trim() || null, amount: data.amount })
    setAmountDigits('')
    setFormOpen(false)
  }

  return (
    <>
      <div className="mb-5 animate-[fadeUp_.4s_ease_.12s_both]">
        {/* Summary bar */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-primary-8-item border border-primary-20 rounded-lg">
          <button
            type="button"
            className="flex-1 flex items-center gap-2 bg-none border-none p-0 cursor-pointer min-w-0 text-inherit"
            onClick={() => expenses.length > 0 && setListOpen(!listOpen)}
            aria-expanded={listOpen ? 'true' : 'false'}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="text-[11px] font-semibold tracking-[.07em] uppercase text-label whitespace-nowrap">
              Gastos do mês
            </span>
            <span className="text-sm font-semibold text-primary whitespace-nowrap">
              {loading ? '…' : formatCurrency(total)}
            </span>
            {expenses.length > 0 && (
              <svg
                className={`text-label shrink-0 transition-transform ${listOpen ? 'rotate-180' : ''}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="shrink-0 flex items-center justify-center w-7 h-7 bg-primary-15 border border-primary-30 rounded-md text-primary cursor-pointer transition-all hover:bg-primary-25"
            onClick={() => setFormOpen(true)}
            aria-label="Adicionar lançamento"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Expense list */}
        {listOpen && expenses.length > 0 && (
          <ul className="flex flex-col gap-px mt-1 py-2 animate-fade-up-sm">
            {expenses.map(expense => (
              <li
                key={expense.id}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-md bg-transparent transition-[background] hover:bg-primary-5 group"
              >
                <div className="flex-1 flex flex-col gap-px min-w-0">
                  <span className="text-[13px] text-text whitespace-nowrap overflow-hidden text-ellipsis">
                    {expense.description || 'Sem descrição'}
                  </span>
                  <span className="text-[10px] text-label tracking-[.03em]">
                    {formatShortDate(expense.created_at)}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-primary whitespace-nowrap shrink-0">
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  className="shrink-0 flex items-center justify-center w-6 h-6 bg-transparent border-none rounded-md text-text-3 cursor-pointer opacity-0 pointer-events-none transition-all group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-[rgba(160,69,53,.15)] hover:text-red [@media(hover:none)]:opacity-100 [@media(hover:none)]:pointer-events-auto"
                  type="button"
                  onClick={() => deleteExpense(expense.id)}
                  aria-label="Remover lançamento"
                >
                  <TrashIcon size={11} strokeWidth={2.5} withHandle={false} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add expense sheet */}
      {formOpen && (
        <div
          className="fixed inset-0 bg-[rgba(28,24,20,.45)] backdrop-blur-sm z-100 flex items-end justify-center animate-fade-in"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="w-full max-w-[480px] bg-surface rounded-[20px_20px_0_0] px-[22px] pt-3 pb-[max(28px,env(safe-area-inset-bottom))] animate-sheet-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3.5" />
            <h3 className="font-syne text-[1.1rem] font-bold tracking-[-0.02em] text-primary mb-[18px]">
              Novo lançamento
            </h3>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
              <input
                className={sheetInputCls}
                placeholder="Descrição (ex: Supermercado)"
                autoComplete="off"
                enterKeyHint="next"
                maxLength={200}
                {...register('description')}
              />
              <div className="flex flex-col gap-1">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[15px] font-semibold text-primary pointer-events-none select-none leading-none">
                    R$
                  </span>
                  <input
                    ref={amountRef}
                    className={`${sheetInputCls} pl-10 ${errors.amount ? 'border-red-500/60' : ''}`}
                    placeholder="0,00"
                    inputMode="numeric"
                    value={formatAmountDisplay(amountDigits)}
                    onChange={handleAmountChange}
                    autoComplete="off"
                    enterKeyHint="done"
                  />
                </div>
                {errors.amount && (
                  <p className="text-[11px] text-red-400 pl-1">{errors.amount.message}</p>
                )}
              </div>
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  className="shrink-0 px-[22px] py-[13px] bg-transparent border border-border rounded-lg text-text-2 font-body text-sm font-medium cursor-pointer transition-all hover:bg-surface-2 hover:text-text-1"
                  onClick={() => setFormOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-[13px] bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-lt))] border-none rounded-lg text-white font-body text-sm font-semibold tracking-[.04em] cursor-pointer transition-[opacity,transform] hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
