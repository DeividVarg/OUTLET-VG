import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = ['db_user', 'db_host', 'db_name', 'db_password']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`error mising some variable`)
  }
}

export const db = new Pool({
  user: process.env.db_user,
  host: process.env.db_host,
  database: process.env.db_name,
  password: process.env.db_password,
  port: parseInt(process.env.db_port || '5432', 10),
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
})

export const connect = async () => {
  try {
    await db.connect()
    console.log('Connected to the database')
  } catch (error) {
    console.error('Error connecting to the database', error)
  }
}

process.on('SIGTERM', () => {
  db.end().then(() => console.log('Pool closed'))
})
