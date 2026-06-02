import { supabase } from '@/shared/services/supabaseClient'
import type { PriceResult } from '@/types'

export async function fetchPriceResults(itemId: string): Promise<PriceResult[]> {
  const { data, error } = await supabase
    .from('price_results')
    .select('*')
    .eq('item_id', itemId)
    .order('price', { ascending: true })
  if (error) throw error
  return data as PriceResult[]
}

export async function triggerPriceSearch(itemId: string, query: string): Promise<PriceResult[]> {
  const { data, error } = await supabase.functions.invoke('search-prices', {
    body: { item_id: itemId, query },
  })
  if (error) throw error
  return (data?.results ?? []) as PriceResult[]
}

export async function copyPriceResultsForItems(idMap: Map<string, string>): Promise<void> {
  const oldIds = [...idMap.keys()]
  if (!oldIds.length) return

  const { data, error } = await supabase.from('price_results').select('*').in('item_id', oldIds)
  if (error) throw error
  if (!data.length) return

  const inserts = (data as PriceResult[])
    .map(({ product_name, price, image_url, product_url, found_at, item_id }) => ({
      item_id: idMap.get(item_id),
      product_name,
      price,
      image_url,
      product_url,
      found_at,
    }))
    .filter(r => r.item_id)

  if (!inserts.length) return

  const { error: insertError } = await supabase.from('price_results').insert(inserts)
  if (insertError) throw insertError
}
