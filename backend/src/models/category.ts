import { db } from '../config/db'

export const categoryModel = async () => {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS categories(
    id uuid default uuid_generate_v4() primary key,
    name varchar(50) not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
    `)
}
