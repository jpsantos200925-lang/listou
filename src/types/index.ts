import type { Tables } from './supabase'

export type List = Tables<'lists'>
export type Item = Tables<'items'>
export type Expense = Tables<'expenses'>
export type PriceResult = Tables<'price_results'>
