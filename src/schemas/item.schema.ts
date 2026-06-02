import { z } from 'zod'

export const itemSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(200),
  quantity: z.string().max(50),
  is_online_purchase: z.boolean(),
})

export type ItemFormData = z.infer<typeof itemSchema>
