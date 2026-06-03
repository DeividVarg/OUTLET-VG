import { db } from "../config/db";

export const userModel = async () => {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users(
    id uuid default uuid_generate_v4() primary key,
    name varchar(50) not null,
    email varchar(255) not null unique,
    password varchar(100) not null,
    number_phone varchar(20) not null,
    role varchar(20) default 'user', 
    verification_code VARCHAR(6), 
    verification_code_expires_at TIMESTAMP,
    reset_password_token VARCHAR(64),
    reset_password_expires_at TIMESTAMP
    )`);
};
