import { db } from "../config/db";

import { response } from "../utils/response";
import { Request, Response } from "express";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  RegisterSchema,
  LoginSchema,
  UpdateUserSchema,
  RegisterAuthSchema,
} from "../schemas/users";

import { PERMISSIONS, Role, Permission } from "../types/permissions";
import { hasPermission } from "../middleware/permissions";

import { sendEmail } from "../utils/resend";
import {
  confirmLoginTemplate,
  welcomeTemplate,
  resetPasswordTemplate,
} from "../templates/templates";

import crypto from "crypto";

const JwtSecretUser = process.env.JWT_SECRET_USER || "defaultTokenSecret";
const JwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";

export const roleCreationPermissionMap: Record<Role, Permission> = {
  user: PERMISSIONS.CREATE_USER,
  employee: PERMISSIONS.CREATE_EMPLOYEE,
  admin: PERMISSIONS.CREATE_ADMIN,
  superAdmin: PERMISSIONS.CREATE_SUPER_ADMIN,
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query("SELECT * FROM users");

    if (!rows) {
      return response({
        res,
        code: 404,
        message: "users not found",
        data: null,
      });
    }

    return response({
      res,
      code: 200,
      message: "users found succesfully",
      data: rows,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying found users",
      data: null,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);

    if (rows.length === 0) {
      return response({
        res,
        code: 404,
        message: "user not found",
        data: null,
      });
    }

    return response({
      res,
      code: 200,
      message: "user found succesfully",
      data: rows,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying found user",
      data: null,
    });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    console.log("hello from get user by email");
    console.log(email);

    if (!email) {
      return response({
        res,
        code: 400,
        message: "email is required",
        data: null,
      });
    }

    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (rows.length === 0) {
      return response({
        res,
        code: 404,
        message: "user not found",
        data: null,
      });
    }
    return response({
      res,
      code: 200,
      message: "user found succesfully",
      data: rows,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying found user",
      data: null,
    });
  }
};

export const Register = async (req: Request, res: Response) => {
  try {
    const result = RegisterSchema.shape.body.safeParse(req.body);

    if (!result.success) {
      console.log("Register data:", result.error);
      const errors = result.error.flatten().fieldErrors;
      return response({
        res,
        code: 400,
        message: "Error de validación",
        data: { errors },
      });
    }

    const { name, email, password, role, number_phone } = result.data;
    console.log("Missing fields:", result.data);

    if (!name || !email || !password || !role || !number_phone) {
      return response({
        res,
        code: 400,
        message: "name, email, password, role and number_phone are required",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      "INSERT INTO users (name, email, password, role, number_phone) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, hashedPassword, role, number_phone],
    );

    const userToken = jwt.sign(
      { id: rows[0].id, email: rows[0].email, role: rows[0].role },
      JwtSecretUser,
      {
        expiresIn: "1h",
      },
    );

    res.cookie("User", userToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    await sendEmail({
      to: email,
      subject: "Bienvenido!",
      html: welcomeTemplate(name),
    });

    return response({
      res,
      code: 201,
      message: "user registered successfully",
      data: {},
    });
  } catch (err) {
    console.error("Error registering user:", err);
    return response({
      res,
      code: 500,
      message: "error trying to register user",
      data: null,
    });
  }
};

export const RegisterAuth = async (req: Request, res: Response) => {
  try {
    const result = RegisterAuthSchema.shape.body.safeParse(req.body);

    if (!result.success) {
      console.log("Register data:", result.error);
      const errors = result.error.flatten().fieldErrors;
      return response({
        res,
        code: 400,
        message: "Error de validación",
        data: { errors },
      });
    }

    const currentUser = req.user;

    if (!currentUser) {
      return response({
        res,
        code: 401,
        message: "Unauthorized desde back",
        data: null,
      });
    }

    const requiredPermission = roleCreationPermissionMap[result.data.role];
    const allowed = hasPermission(currentUser.role as Role, requiredPermission);

    if (!allowed) {
      return response({
        res,
        code: 403,
        message: "No tienes permisos para crear este tipo de usuario",
        data: null,
      });
    }

    const { name, email, password, role, number_phone } = result.data;
    console.log("Missing fields:", result.data);

    if (!name || !email || !password || !role || !number_phone) {
      return response({
        res,
        code: 400,
        message: "name, email, password, role and number_phone are required",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      "INSERT INTO users (name, email, password, role, number_phone) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, hashedPassword, role, number_phone],
    );

    return response({
      res,
      code: 201,
      message: "user registered successfully",
      data: {
        email: rows[0].email,
        name: rows[0].name,
        role: rows[0].role,
      },
    });
  } catch (err) {
    console.error("Error registering user:", err);
    return response({
      res,
      code: 500,
      message: "error trying to register user",
      data: null,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = LoginSchema.shape.body.safeParse(req.body);
    if (!result.success) {
      return response({
        res,
        code: 400,
        message: "email and password are required",
        data: null,
      });
    }

    const { email, password } = result.data;

    const { rows } = await db.query(
      "SELECT id, email, name, role, password FROM users WHERE email = $1",
      [email],
    );

    if (rows.length === 0) {
      return response({
        res,
        code: 404,
        message: "user not found",
        data: null,
      });
    }

    const user = rows[0];
    const verifyPassword = await bcrypt.compare(password, user.password);

    if (!verifyPassword) {
      return response({
        res,
        code: 401,
        message: "invalid password",
        data: null,
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      "UPDATE users SET verification_code = $1, verification_code_expires_at = $2 WHERE id = $3",
      [code, expiresAt, user.id],
    );

    await sendEmail({
      to: user.email,
      subject: "Código de verificación",
      html: confirmLoginTemplate({ nombre: user.name, codigo: code }),
    });

    return response({
      res,
      code: 200,
      message: "verification code sent",
      data: { userId: user.id },
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying to login",
      data: null,
    });
  }
};

export const verifyLogin = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return response({
        res,
        code: 400,
        message: "userId and code are required",
        data: null,
      });
    }

    const { rows } = await db.query(
      "SELECT id, email, role, verification_code, verification_code_expires_at FROM users WHERE id = $1",
      [userId],
    );

    if (rows.length === 0) {
      return response({
        res,
        code: 404,
        message: "user not found",
        data: null,
      });
    }

    const user = rows[0];

    if (user.verification_code !== code) {
      return response({ res, code: 401, message: "invalid code", data: null });
    }

    if (new Date() > new Date(user.verification_code_expires_at)) {
      return response({ res, code: 401, message: "code expired", data: null });
    }

    await db.query(
      "UPDATE users SET verification_code = NULL, verification_code_expires_at = NULL WHERE id = $1",
      [user.id],
    );

    const userToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JwtSecretUser,
      { expiresIn: "7d" },
    );

    res.cookie("User", userToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return response({
      res,
      code: 200,
      message: "user logged in successfully",
      data: [],
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error verifying code",
      data: null,
    });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.User;

    if (!token) {
      return response({
        res,
        code: 401,
        message: "No authenticated",
        data: null,
      });
    }

    const decoded = jwt.verify(token, JwtSecretUser) as any;

    return response({
      res,
      code: 200,
      message: "user session valid",
      data: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (err) {
    return response({
      res,
      code: 401,
      message: "Invalid session",
      data: null,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("User", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      domain: process.env.COOKIE_DOMAIN || "localhost",
    });
    return response({
      res,
      code: 200,
      message: "user logged out successfully",
      data: null,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying to logout user",
      data: null,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = UpdateUserSchema.shape.body.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return response({
        res,
        code: 400,
        message: "email and password are required",
        data: { errors },
      });
    }

    const updateData = result.data;

    if (Object.keys(updateData).length === 0) {
      return response({
        res,
        code: 400,
        message: "No fields provided for update",
        data: null,
      });
    }

    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const values = Object.values(updateData);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${setClause} 
      WHERE id = $${values.length}
      RETURNING *
    `;

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return response({
        res,
        code: 404,
        message: "User not found",
        data: null,
      });
    }

    return response({
      res,
      code: 200,
      message: "User updated successfully",
      data: rows[0],
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return response({
      res,
      code: 500,
      message: "Error trying to update user",
      data: null,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Quién ejecuta la acción
    const callerRole = req.user!.role as Role;

    // Rol del usuario a eliminar — viene de la DB, no del cliente
    const { rows: targetRows } = await db.query(
      "SELECT role FROM users WHERE id = $1",
      [id],
    );

    if (!targetRows.length) {
      return response({
        res,
        code: 404,
        message: "user not found",
        data: null,
      });
    }

    const targetRole = targetRows[0].role;

    // Mapa de permiso requerido según el rol del target
    const deletePermissionMap: Record<string, Permission> = {
      user: PERMISSIONS.DELETE_USER,
      employee: PERMISSIONS.DELETE_EMPLOYEE,
      admin: PERMISSIONS.DELETE_ADMIN,
      superAdmin: PERMISSIONS.DELETE_SUPER_ADMIN,
    };

    const requiredPermission = deletePermissionMap[targetRole];
    const allowed = hasPermission(callerRole, requiredPermission);

    if (!allowed) {
      return response({
        res,
        code: 403,
        message: "Forbidden: insufficient permissions",
        data: null,
      });
    }

    await db.query("DELETE FROM users WHERE id = $1", [id]);

    return response({
      res,
      code: 200,
      message: "user deleted successfully",
      data: null,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying to delete user",
      data: null,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return response({
        res,
        code: 400,
        message: "email is required",
        data: null,
      });
    }

    const { rows } = await db.query(
      "SELECT id, email, name FROM users WHERE email = $1",
      [email],
    );

    if (rows.length === 0) {
      return response({
        res,
        code: 200,
        message: "if the email exists you will receive a link",
        data: null,
      });
    }

    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires_at = $2 WHERE id = $3",
      [token, expiresAt, user.id],
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Restablecer contraseña",
      html: resetPasswordTemplate(resetUrl),
    });

    return response({
      res,
      code: 200,
      message: "if the email exists you will receive a link",
      data: null,
    });
  } catch (err) {
    console.log("Error in forgotPassword:", err);
    return response({
      res,
      code: 500,
      message: "error processing request",
      data: null,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return response({
        res,
        code: 400,
        message: "token and newPassword are required",
        data: null,
      });
    }

    const { rows } = await db.query(
      "SELECT id, reset_password_expires_at FROM users WHERE reset_password_token = $1",
      [token],
    );

    if (rows.length === 0) {
      return response({ res, code: 401, message: "invalid token", data: null });
    }

    const user = rows[0];

    if (new Date() > new Date(user.reset_password_expires_at)) {
      return response({ res, code: 401, message: "token expired", data: null });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = $2",
      [hashedPassword, user.id],
    );

    return response({
      res,
      code: 200,
      message: "password updated successfully",
      data: null,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error resetting password",
      data: null,
    });
  }
};
