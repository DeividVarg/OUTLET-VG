import { db } from '../config/db'

export const productModel = async () => {
  try {
    await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

    await db.query(`
      CREATE TABLE IF NOT EXISTS products(
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        state VARCHAR(20) NOT NULL DEFAULT 'not available',
        category_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
    `)

    await db.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await db.query(`
      CREATE TABLE IF NOT EXISTS products_images (
        product_id UUID NOT NULL,
        image_id INTEGER NOT NULL,
        PRIMARY KEY (product_id, image_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
      );
    `)

    console.log('Product tables created successfully')
  } catch (error) {
    console.error('Error creating product tables:', error)
    throw error
  }
}
