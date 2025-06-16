import { db } from '../config/db'

export const cartModel = async () => {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS cart (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )	

    `)
  await db.query(`
  CREATE TABLE IF NOT EXISTS cart_products(
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cart_id UUID NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `)
}
