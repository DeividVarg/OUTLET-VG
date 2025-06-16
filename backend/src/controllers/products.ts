import { db } from '../config/db'
import { response } from '../utils/response'
import { Request, Response } from 'express'
import { upload, convertToWebP } from '../config/multer'

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, state, category_id } = req.body

    const { rows } = await db.query(
      `
      INSERT INTO products (name, description, price, state, category_id)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [name, description, price, state, category_id]
    )

    if (!rows) {
      return response({
        res,
        code: 400,
        message: 'product not created',
        data: null,
      })
    }

    const productId = rows[0].id
    const images = req.body.images

    const imageIds = []

    if (!images) {
      return response({
        res,
        code: 400,
        message: 'no images, try again',
        data: null,
      })
    }

    for (const image of images) {
      const imageUrl = `/uploads/${image.filename}`

      const imageResult = await db.query(
        `INSERT INTO images (url) VALUES ($1) RETURNING id`,
        [image.url]
      )

      imageIds.push(imageResult.rows[0].id)
    }

    for (const imageId of imageIds) {
      await db.query(
        `INSERT INTO products_images (product_id, image_id) VALUES ($1, $2)`,
        [productId, imageId]
      )
    }

    return response({
      res,
      code: 201,
      message: 'product created successfully',
      data: rows[0],
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying to create product',
      data: null,
    })
  }
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(`
      SELECT p.*, i.url AS image_url
      FROM products p
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
    `)

    if (!rows.length) {
      return response({
        res,
        code: 404,
        message: 'no products found',
        data: null,
      })
    }

    return response({
      res,
      code: 200,
      message: 'products retrieved successfully',
      data: rows,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying to retrieve products',
      data: null,
    })
  }
}

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { rows } = await db.query(
      `
      SELECT p.*, i.url AS image_url
      FROM products p
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      WHERE p.id = $1
    `,
      [id]
    )

    if (!rows.length) {
      return response({
        res,
        code: 404,
        message: 'product not found',
        data: null,
      })
    }

    return response({
      res,
      code: 200,
      message: 'product retrieved successfully',
      data: rows[0],
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying to retrieve product',
      data: null,
    })
  }
}

export const getProductByCategory = async (req: Request, res: Response) => {
  try {
    const { id_category } = req.params

    const { rows } = await db.query(
      `
      SELECT p.*, i.url AS image_url
      FROM products p
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      WHERE p.category_id = $1
    `,
      [id_category]
    )

    if (!rows.length) {
      return response({
        res,
        code: 404,
        message: 'product not found',
        data: null,
      })
    }

    return response({
      res,
      code: 200,
      message: 'product retrieved successfully',
      data: rows[0],
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying to retrieve product',
      data: null,
    })
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { rowCount } = await db.query(
      `
      DELETE FROM products
      WHERE id = $1
    `,
      [id]
    )

    if (rowCount === 0) {
      return response({
        res,
        code: 404,
        message: 'product not found',
        data: null,
      })
    }

    return response({
      res,
      code: 200,
      message: 'product deleted successfully',
      data: null,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'error trying to delete product',
      data: null,
    })
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, price, state, category_id, imagesToDelete } =
      req.body

    const queryValues = [id]
    let paramIndex = 2
    const queryParts = []

    if (name) {
      queryParts.push(`name = $${paramIndex}`)
      queryValues.push(name)
      paramIndex++
    }

    if (description) {
      queryParts.push(`description = $${paramIndex}`)
      queryValues.push(description)
      paramIndex++
    }

    if (price) {
      queryParts.push(`price = $${paramIndex}`)
      queryValues.push(price)
      paramIndex++
    }

    if (state) {
      queryParts.push(`state = $${paramIndex}`)
      queryValues.push(state)
      paramIndex++
    }

    if (category_id) {
      queryParts.push(`category_id = $${paramIndex}`)
      queryValues.push(category_id)
      paramIndex++
    }

    if (queryParts.length > 0) {
      queryParts.push(`updated_at = CURRENT_TIMESTAMP`)

      const query = `
        UPDATE products
        SET ${queryParts.join(', ')}
        WHERE id = $1
      `

      const { rows } = await db.query(query, queryValues)

      if (!rows?.length) {
        return response({
          res,
          code: 404,
          message: 'Producto no encontrado o no actualizado',
          data: null,
        })
      }
    }

    if (imagesToDelete?.length > 0) {
      const deleteRelationsResult = await db.query(
        `DELETE FROM products_images 
         WHERE product_id = $1 AND image_id = ANY($2::int[])`,
        [id, imagesToDelete]
      )

      if (deleteRelationsResult.rowCount === 0) {
        return response({
          res,
          code: 404,
          message: 'Imagen no encontrada o no eliminada',
          data: null,
        })
      }

      const deleteImagesResult = await db.query(
        `DELETE FROM images WHERE id = ANY($1::int[])`,
        [imagesToDelete]
      )

      if (deleteImagesResult.rowCount === 0) {
        return response({
          res,
          code: 404,
          message: 'Imagen no encontrada o no eliminada',
          data: null,
        })
      }
    }

    if (req.body.images?.length > 0) {
      const imageIds = []

      for (const image of req.body.images) {
        const imageUrl = `/uploads/${image.filename}`
        const imageResult = await db.query(
          `INSERT INTO images (url) VALUES ($1) RETURNING id`,
          [imageUrl]
        )
        imageIds.push(imageResult.rows[0].id)
      }

      for (const imageId of imageIds) {
        await db.query(
          `INSERT INTO products_images (product_id, image_id) VALUES ($1, $2)`,
          [id, imageId]
        )
      }
    }

    return response({
      res,
      code: 200,
      message: 'Producto actualizado exitosamente',
      data: null,
    })
  } catch (err) {
    return response({
      res,
      code: 500,
      message: 'Error interno al actualizar el producto',
      data: null,
    })
  }
}
