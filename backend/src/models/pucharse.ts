import { db } from "../config/db";

export const purchaseModel = async () => {
  await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL,
      direction varchar(200) NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      phone VARCHAR(20) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS purchase_products (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      purchase_id UUID NOT NULL,
      product_id UUID NOT NULL,
      quantity INT NOT NULL,
      unit_price NUMERIC(10, 2) NOT NULL,
      FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      purchase_id UUID NOT NULL,
      provider VARCHAR(20) NOT NULL, -- 'transbank' | 'mercadopago'
      token VARCHAR(100),
      authorization_code VARCHAR(20),
      status VARCHAR(30),
      payment_type VARCHAR(10),
      card_last_four VARCHAR(4),
      amount NUMERIC(10, 2) NOT NULL,
      raw_response JSONB, -- guarda toda la respuesta del proveedor por si acaso
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
    )
  `);
};
