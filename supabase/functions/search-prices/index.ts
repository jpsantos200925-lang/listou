import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getMlToken(): Promise<string> {
  // Usa token estático se configurado, senão gera um novo via client_credentials
  const staticToken = Deno.env.get('ML_ACCESS_TOKEN')
  if (staticToken) return staticToken

  const appId     = Deno.env.get('ML_APP_ID')
  const appSecret = Deno.env.get('ML_APP_SECRET')
  if (!appId || !appSecret) throw new Error('ML_APP_ID e ML_APP_SECRET não configurados')

  const res = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${appId}&client_secret=${appSecret}`,
  })
  if (!res.ok) throw new Error('Falha ao obter token do ML')
  const data = await res.json()
  return data.access_token
}

async function mlFetch(url: string, token: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return null
  return res.json()
}

async function searchPrices(query: string, itemId: string, token: string) {
  const products = await mlFetch(
    `https://api.mercadolibre.com/products/search?site_id=MLB&q=${encodeURIComponent(query)}&limit=20`,
    token
  )
  if (!products?.results?.length) return []

  const results = []

  for (const prod of products.results) {
    if (results.length >= 5) break

    const pid  = prod.id
    const name = prod.name as string

    const [itemsData, detail] = await Promise.all([
      mlFetch(`https://api.mercadolibre.com/products/${pid}/items?limit=3`, token),
      mlFetch(`https://api.mercadolibre.com/products/${pid}?attributes=pictures`, token),
    ])

    const items = itemsData?.results ?? []
    if (!items.length) continue

    const price    = Math.min(...items.map((i: { price: number }) => i.price))
    const pics     = detail?.pictures ?? []
    const thumbnail = pics[0]?.url ?? null

    results.push({
      item_id:      itemId,
      product_name: name,
      price,
      image_url:    thumbnail,
      product_url:  `https://www.mercadolivre.com.br/p/${pid}`,
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

    const mlToken = await getMlToken()
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
