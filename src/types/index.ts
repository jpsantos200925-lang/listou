export interface List {
  id: string
  user_id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  bg_color: string
  font_color: string
  title_color: string
  label_color: string
  item_bg_color: string
  created_at: string
}

export interface Item {
  id: string
  list_id: string
  name: string
  quantity: string
  month: string
  checked: boolean
  is_online_purchase: boolean
  created_at: string
}

export interface Expense {
  id: string
  list_id: string
  description: string | null
  amount: number
  month: string
  created_at: string
}

export interface PriceResult {
  id: string
  item_id: string
  product_name: string
  price: number
  image_url: string | null
  product_url: string
  found_at: string
}
