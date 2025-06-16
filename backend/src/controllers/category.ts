import { db } from '../config/db'
import { response } from '../utils/response'
import { Request, Response } from 'express'

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
    const { id } = req.body
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
    const { name, description } = req.body

    const { rows } = await db.query(
      'INSERT INTO CATEGORIES (name, description) VALUES ($1, $2)',
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
    const { id, name, description } = req.body

    const { rows } = await db.query(
      'UPDATE CATEGORIES SET name = $1, description = $2 WHERE id = $3',
      [name, description, id]
    )
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
    const { id } = req.body

    const { rows } = await db.query('DELETE FROM CATEGORIES WHERE id = $1', [
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
