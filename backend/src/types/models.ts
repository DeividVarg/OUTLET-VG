export interface user {
  id?: string
  name: string
  last_name: string
  email: string
  password: string
  created_at?: Date
  role?: string
}

export interface product {
  id?: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  created_at?: Date
  updated_at?: Date
}

export interface category {
  id?: string
  name: string
  created_at?: Date
}

export interface cart {
  id?: string
  user_id: string
  products: []
}

export interface cart_products {
  id?: string
  cart_id: string
  product_id: string
  quantity: number
  created_at?: Date
  updated_at?: Date
}

export interface pucharse {
  id?: string
  user_id: string
  products: []
  total: number
  created_at?: Date
}

export interface purchase_products {
  id?: string
  purchase_id: string
  product_id: string
  quantity: number
}
