import { z } from 'zod'

export const listSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(200),
  slug: z
    .string()
    .min(1, 'Slug obrigatório')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífen'),
  primary_color: z.string(),
  secondary_color: z.string(),
  bg_color: z.string(),
  font_color: z.string(),
  title_color: z.string(),
  label_color: z.string(),
  item_bg_color: z.string(),
})

export type ListFormData = z.infer<typeof listSchema>
