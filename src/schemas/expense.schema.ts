import { z } from 'zod'

export const expenseSchema = z.object({
  description: z.string().max(200).nullable().optional(),
  amount: z
    .number({ error: 'Valor inválido' })
    .positive('Valor deve ser maior que zero'),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>
