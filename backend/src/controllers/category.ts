import { db } from '../config/db'
import { response } from '../utils/response'
import { Request, Response } from 'express'
import { CreateCategorySchema, UpdateCategorySchema } from '../schemas/category'

export const GetCategories = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query('SELECT * FROM CATEGORIES')
    if (!rows) {
      return response({
        res,
        code: 404,
        message: 'categories not found',
        data: null,
      })
    }
    return response({
      res,
      code: 200,
      message: 'categories found succesfull',
      data: rows,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error when trying found categories',
      data: null,
    })
  }
}

export const GetCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { rows } = await db.query('SELECT * FROM CATEGORIES WHERE id = $1', [
      id,
    ])
    if (!rows) {
      return response({
        res,
        code: 404,
        message: 'category not found',
        data: null,
      })
    }
    return response({
      res,
      code: 200,
      message: 'category found succesfully',
      data: rows,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying found category',
      data: null,
    })
  }
}

export const createCategory = async (req: Request, res: Response) => {
  try {
    const result = CreateCategorySchema.safeParse(req.body)

    if (!result.success) {
      return response({
        res,
        code: 400,
        message: 'Invalid category data',
        data: result.error.errors,
      })
    }

    const { name, description } = result.data

    const { rows } = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2)',
      [name, description]
    )

    return response({
      res,
      code: 200,
      message: 'category created succesfully',
      data: rows,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying create category',
      data: null,
    })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = UpdateCategorySchema.safeParse(req.body)

    if (!result.success) {
      return response({
        res,
        code: 400,
        message: 'Invalid category data',
        data: result.error.errors,
      })
    }

    const { name, description } = result.data

    const updates = []
    const values = []
    let paramIndex = 1

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`)
      values.push(name)
      paramIndex++
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`)
      values.push(description)
      paramIndex++
    }

    if (updates.length === 0) {
      return response({
        res,
        code: 500,
        message: 'error trying update category',
        data: null,
      })
    }

    values.push(id)

    const query = `
      UPDATE categories 
      SET ${updates.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramIndex}
    `

    const { rows } = await db.query(query, values)

    return response({
      res,
      code: 200,
      message: 'category updated succesfully',
      data: rows,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying update category',
      data: null,
    })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { rows } = await db.query('DELETE FROM categories WHERE id = $1', [
      id,
    ])

    return response({
      res,
      code: 200,
      message: 'category deleted succesfully',
      data: rows,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying delete category',
      data: null,
    })
  }
}
