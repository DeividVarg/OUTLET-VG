import { db } from '../config/db'
import { response } from '../utils/response'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {
  RegisterSchema,
  LoginSchema,
  UpdateUserSchema,
} from '../schemas/users'

const JwtSecretUser = process.env.JWT_SECRET_USER || 'defaultTokenSecret'
const JwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h'

export const getUsers = async (req: Request, res: Response) => {
  try {
    console.log('getUsers called')
    const { rows } = await db.query('SELECT * FROM users')

    if (!rows) {
      return response({
        res,
        code: 404,
        message: 'users not found',
        data: null,
      })
    }

    return response({
      res,
      code: 200,
      message: 'users found succesfully',
      data: rows,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying found users',
      data: null,
    })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id])

    if (rows.length === 0) {
      return response({
        res,
        code: 404,
        message: 'user not found',
        data: null,
      })
    }

    return response({
      res,
      code: 200,
      message: 'user found succesfully',
      data: rows,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying found user',
      data: null,
    })
  }
}

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params

    console.log('hello from get user by email')
    console.log(email)

    if (!email) {
      return response({
        res,
        code: 400,
        message: 'email is required',
        data: null,
      })
    }

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    if (rows.length === 0) {
      return response({
        res,
        code: 404,
        message: 'user not found',
        data: null,
      })
    }
    return response({
      res,
      code: 200,
      message: 'user found succesfully',
      data: rows,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying found user',
      data: null,
    })
  }
}

export const Register = async (req: Request, res: Response) => {
  try {
    const result = RegisterSchema.shape.body.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return response({
        res,
        code: 400,
        message: 'Error de validación',
        data: { errors },
      })
    }

    const { name, last_name, email, password, password2, role } = result.data

    if (password !== password2) {
      return response({
        res,
        code: 400,
        message: 'Las contraseñas no coinciden',
        data: null,
      })
    }

    if (!name || !email || !password || !last_name || !role) {
      return response({
        res,
        code: 400,
        message: 'name, last_name, email and password are required',
        data: null,
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { rows } = await db.query(
      'INSERT INTO users (name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, last_name, email, hashedPassword, role]
    )

    const newUserToken = jwt.sign(
      { id: rows[0].id, email: rows[0].email, role: rows[0].role },
      JwtSecretUser,
      { expiresIn: '1h' }
    )

    res.cookie('User', newUserToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      path: '/',
    })

    return response({
      res,
      code: 201,
      message: 'user registered successfully',
      data: {
        email: rows[0].email,
        name: rows[0].name,
        role: rows[0].role,
      },
    })
  } catch (err) {
    console.error('Error registering user:', err)
    return response({
      res,
      code: 500,
      message: 'error trying to register user',
      data: null,
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const result = LoginSchema.shape.body.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return response({
        res,
        code: 400,
        message: 'email and password are required',
        data: { errors },
      })
    }

    const { email, password } = result.data

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])

    if (!rows || rows.length === 0) {
      return response({
        res,
        code: 404,
        message: 'user not found',
        data: null,
      })
    }

    const User = rows[0]

    const verifyPassword = bcrypt.compare(password, User?.password)

    if (!verifyPassword) {
      return response({
        res,
        code: 401,
        message: 'invalid password',
        data: null,
      })
    }

    if (rows.length === 0) {
      return response({
        res,
        code: 401,
        message: 'invalid credentials',
        data: null,
      })
    }

    const user = rows[0]

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return response({
        res,
        code: 401,
        message: 'invalid credentials',
        data: null,
      })
    }

    const userToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JwtSecretUser,
      { expiresIn: '1h' }
    )

    res.cookie('User', userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      path: '/',
    })

    return response({
      res,
      code: 200,
      message: 'user logged in successfully',
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying to login user',
      data: null,
    })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('User', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || 'localhost',
    })
    return response({
      res,
      code: 200,
      message: 'user logged out successfully',
      data: null,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying to logout user',
      data: null,
    })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = UpdateUserSchema.shape.body.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return response({
        res,
        code: 400,
        message: 'email and password are required',
        data: { errors },
      })
    }

    const updateData = result.data

    if (Object.keys(updateData).length === 0) {
      return response({
        res,
        code: 400,
        message: 'No fields provided for update',
        data: null,
      })
    }

    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ')

    const values = Object.values(updateData)
    values.push(id)

    const query = `
      UPDATE users 
      SET ${setClause} 
      WHERE id = $${values.length}
      RETURNING *
    `

    const { rows } = await db.query(query, values)

    if (rows.length === 0) {
      return response({
        res,
        code: 404,
        message: 'User not found',
        data: null,
      })
    }

    return response({
      res,
      code: 200,
      message: 'User updated successfully',
      data: rows[0],
    })
  } catch (err) {
    console.error('Error updating user:', err)
    return response({
      res,
      code: 500,
      message: 'Error trying to update user',
      data: null,
    })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { rows } = await db.query('DELETE FROM users WHERE id = $1', [id])

    if (!rows) {
      return response({
        res,
        code: 404,
        message: 'user not found',
        data: null,
      })
    }

    return response({
      res,
      code: 200,
      message: 'user deleted successfully',
      data: null,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying to delete user',
      data: null,
    })
  }
}
