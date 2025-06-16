import { db } from '../config/db'

export const purchaseModel = async () => {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS purchases(
    id uuid default uuid_generate_v4() primary key,
    user_id uuid not null,	
    total NUMERIC(10, 2) not null,
    FOREIGN KEY (user_id) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )
`)

  await db.query(`
    CREATE TABLE IF NOT EXISTS products_on_pucharse(
    id uuid default uuid_generate_v4() primary key,
    product_id uuid not null,
    FOREIGN KEY (product_id) REFERENCES products(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS purchase_products(
    products_on_pucharse_id uuid not null,
    purchase_id uuid not null,
    PRIMARY KEY (products_on_pucharse_id, purchase_id),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (products_on_pucharse_id) REFERENCES products_on_pucharse(id)
    )
    `)
}
