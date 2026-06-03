import { db } from "./db";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const requiredEnvVars = [
  "adminUser",
  "adminPassword",
  "adminEmail",
  "adminRole",
  "userEmail",
  "userPassword",
  "userUser",
  "userRole",
  "userNumber_phone",
  "adminNumber_phone",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}

const searchDefaultUser = async () => {
  try {
    const res = await db.query("select role from users where email = $1", [
      process.env.userEmail,
    ]);
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createDefaultUser = async () => {
  try {
    const password = process.env.userPassword || "1234psw";

    if (!password) {
      throw new Error("Missing userPassword");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const rows = await db.query(
      "INSERT INTO users (name, email, password, role, number_phone) VALUES ($1, $2, $3, $4, $5) RETURNING * ",
      [
        process.env.userUser,
        process.env.userEmail,
        hashedPassword,
        process.env.userRole,
        process.env.userNumber_phone,
      ],
    );
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const search = async () => {
  try {
    const res = await db.query("select role from users where email = $1", [
      process.env.adminEmail,
    ]);
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const create = async () => {
  try {
    const password = process.env.adminPassword || "1234psw";

    if (!password) {
      throw new Error("Missing adminPassword");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const rows = await db.query(
      "INSERT INTO users (name, email, password, role, number_phone) VALUES ($1, $2, $3, $4, $5) RETURNING * ",
      [
        process.env.adminUser,
        process.env.adminEmail,
        hashedPassword,
        process.env.adminRole,
        process.env.adminNumber_phone,
      ],
    );
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const defaultUser = async () => {
  try {
    const searchUser = await search();
    const searchDefault = await searchDefaultUser();

    if (searchDefault !== null) {
      return;
    }

    if (searchUser !== null) {
      return;
    }

    const createUser = await create();
    const createDefault = await createDefaultUser();

    if (createUser) {
      console.log("user create");
    }

    if (createDefault) {
      console.log("default user create");
    }
  } catch (error) {
    console.log(error);
  }
};
