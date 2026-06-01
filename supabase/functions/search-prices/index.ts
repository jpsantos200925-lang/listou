import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function mlFetch(url: string, token: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return null
  return res.json()
}

async function searchPrices(query: string, itemId: string, token: string) {
  // 1. Buscar produtos do catálogo ML
  const products = await mlFetch(
    `https://api.mercadolibre.com/products/search?site_id=MLB&q=${encodeURIComponent(query)}&limit=20`,
    token
  )
  if (!products?.results?.length) return []

  const results = []

  for (const prod of products.results) {
    if (results.length >= 5) break

    const pid = prod.id
    const name = prod.name as string

    // 2. Buscar listagens ativas e thumbnail em paralelo
    const [itemsData, detail] = await Promise.all([
      mlFetch(`https://api.mercadolibre.com/products/${pid}/items?limit=3`, token),
      mlFetch(`https://api.mercadolibre.com/products/${pid}?attributes=pictures`, token),
    ])

    const items = itemsData?.results ?? []
    if (!items.length) continue

    const price = Math.min(...items.map((i: { price: number }) => i.price))
    const pics = detail?.pictures ?? []
    const thumbnail = pics[0]?.url ?? null

    results.push({
      item_id: itemId,
      product_name: name,
      price,
      image_url: thumbnail,
      product_url: `https://www.mercadolivre.com.br/p/${pid}`,
    })
  }

  return results
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { item_id, query } = await req.json()
    if (!item_id || !query?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing item_id or query' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const mlToken = Deno.env.get('ML_ACCESS_TOKEN')
    if (!mlToken) {
      return new Response(JSON.stringify({ error: 'ML_ACCESS_TOKEN não configurado' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results = await searchPrices(query, item_id, mlToken)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabaseAdmin.from('price_results').delete().eq('item_id', item_id)

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('price_results')
      .insert(results)
      .select()

    if (insertError) throw insertError

    return new Response(JSON.stringify({ results: inserted ?? [] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
