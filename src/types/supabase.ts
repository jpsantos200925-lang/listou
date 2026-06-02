// Arquivo gerado automaticamente. Para atualizar: npm run gen:types
export type Database = {
  public: {
    Tables: {
      lists: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          primary_color: string
          secondary_color: string
          bg_color: string
          font_color: string
          title_color: string
          label_color: string
          item_bg_color: string
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          slug: string
          primary_color?: string
          secondary_color?: string
          bg_color?: string
          font_color?: string
          title_color?: string
          label_color?: string
          item_bg_color?: string
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          primary_color?: string
          secondary_color?: string
          bg_color?: string
          font_color?: string
          title_color?: string
          label_color?: string
          item_bg_color?: string
          logo_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          id: string
          list_id: string
          month: string
          name: string
          quantity: string
          checked: boolean
          is_online_purchase: boolean
          created_at: string
        }
        Insert: {
          id?: string
          list_id: string
          month: string
          name: string
          quantity?: string
          checked?: boolean
          is_online_purchase?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          month?: string
          name?: string
          quantity?: string
          checked?: boolean
          is_online_purchase?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'items_list_id_fkey'
            columns: ['list_id']
            referencedRelation: 'lists'
            referencedColumns: ['id']
          },
        ]
      }
      expenses: {
        Row: {
          id: string
          list_id: string
          month: string
          description: string | null
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          list_id: string
          month: string
          description?: string | null
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          month?: string
          description?: string | null
          amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'expenses_list_id_fkey'
            columns: ['list_id']
            referencedRelation: 'lists'
            referencedColumns: ['id']
          },
        ]
      }
      price_results: {
        Row: {
          id: string
          item_id: string
          product_name: string
          price: number
          image_url: string | null
          product_url: string | null
          found_at: string
        }
        Insert: {
          id?: string
          item_id: string
          product_name: string
          price: number
          image_url?: string | null
          product_url?: string | null
          found_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          product_name?: string
          price?: number
          image_url?: string | null
          product_url?: string | null
          found_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'price_results_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
