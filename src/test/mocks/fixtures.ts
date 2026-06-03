import type { List, Item } from '@/types'

export const listFixtures: List[] = [
  {
    id: 'list-1',
    user_id: 'user-1',
    name: 'Compras da Semana',
    slug: 'compras-da-semana',
    logo_url: null,
    primary_color: '#22c55e',
    secondary_color: '#16a34a',
    bg_color: '#0f0f0f',
    font_color: '#f0f0f0',
    title_color: '#f5f5f5',
    label_color: '#888888',
    item_bg_color: '#1e1e1e',
    created_at: '2024-01-01T00:00:00Z',
  },
]

export const itemFixtures: Item[] = [
  {
    id: 'item-1',
    list_id: 'list-1',
    name: 'Arroz',
    quantity: '2 kg',
    month: '2024-03',
    checked: false,
    is_online_purchase: false,
    created_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'item-2',
    list_id: 'list-1',
    name: 'Leite',
    quantity: '1 L',
    month: '2024-03',
    checked: true,
    is_online_purchase: false,
    created_at: '2024-03-01T10:01:00Z',
  },
  {
    id: 'item-3',
    list_id: 'list-1',
    name: 'Notebook',
    quantity: '1',
    month: '2024-03',
    checked: false,
    is_online_purchase: true,
    created_at: '2024-03-01T10:02:00Z',
  },
]
