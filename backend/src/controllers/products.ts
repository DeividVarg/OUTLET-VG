import { db } from '../config/db'
import { response } from '../utils/response'
import { Request, Response } from 'express'
import { upload, convertToWebP } from '../config/multer'
import { productoSchema, updateProductoSchema } from '../schemas/products'
import { z } from 'zod'

export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log(req.body)
    const preprocessedData = {
      ...req.body,
      price: Number(req.body.price),
      category_id: req.body.category_id.trim(),
      images: req.body.images,
    }
    const result = productoSchema.safeParse(preprocessedData)

    if (!result.success) {
      return response({
        res,
        code: 400,
        message: 'Invalid product data',
        data: result.error.errors,
      })
    }

    const { name, description, price, state, category_id, images } = result.data

    const { rows } = await db.query(
      `INSERT INTO products (name, description, price, state, category_id, created_at)
       VALUES ($1, $2, $3, $4, $5, now())
       RETURNING id`,
      [name, description, price, state, category_id]
    )

    if (!rows || !rows[0]) {
      return response({
        res,
        code: 400,
        message: 'Product not created',
        data: null,
      })
    }

    const productId = rows[0].id

    if (images && images.length > 0) {
      for (const file of images) {
        const imageUrl = `/uploads/${file}`
        const imageResult = await db.query(
          `INSERT INTO images (url) VALUES ($1) RETURNING id`,
          [imageUrl]
        )
        await db.query(
          `INSERT INTO products_images (product_id, image_id) VALUES ($1, $2)`,
          [productId, imageResult.rows[0].id]
        )
      }
    }

    return response({
      res,
      code: 201,
      message: 'Product created successfully',
      data: { ...rows[0] },
    })
  } catch (err) {
    console.error('Error:', err)
    return response({
      res,
      code: 500,
      message: 'Error trying to create product',
      data: null,
    })
  }
}
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.state,
        p.category_id,
        p.created_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN i.id IS NOT NULL THEN json_build_object('id', i.id, 'url', i.url) END
          ) FILTER (WHERE i.id IS NOT NULL), 
          '[]'
        ) AS images
      FROM products p
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      GROUP BY p.id
    `)

    return response({
      res,
      code: 200,
      message: 'products retrieved successfully',
      data: rows,
    })
  } catch (err) {
    console.error(err)
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
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.state,
        p.category_id,
        p.created_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN i.id IS NOT NULL THEN json_build_object('id', i.id, 'url', i.url) END
          ) FILTER (WHERE i.id IS NOT NULL), 
          '[]'
        ) AS images
      FROM products p
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      WHERE p.id = $1
      GROUP BY p.id
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
    console.error('Error fetching product by ID:', err)
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
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.state,
        p.category_id,
        p.created_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN i.id IS NOT NULL THEN json_build_object('id', i.id, 'url', i.url) END
          ) FILTER (WHERE i.id IS NOT NULL), 
          '[]'
        ) AS images
      FROM products p
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      WHERE p.category_id = $1
      GROUP BY p.id
    `,
      [id_category]
    )

    if (!rows.length) {
      return response({
        res,
        code: 404,
        message: 'no products found for this category',
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
    console.error('Error fetching products by category:', err)
    return response({
      res,
      code: 500,
      message: 'error trying to retrieve products',
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
    const body = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      imagesToDelete: req.body.imagesToDelete
        ? Array.isArray(req.body.imagesToDelete)
          ? req.body.imagesToDelete.map(Number)
          : [Number(req.body.imagesToDelete)]
        : [],
    }

    const parsedBody = updateProductoSchema.safeParse(body)
    if (!parsedBody.success) {
      return response({
        res,
        code: 400,
        message: 'Datos inválidos',
        data: null,
      })
    }

    const { id } = req.params
    const {
      name,
      description,
      price,
      state,
      category_id,
      imagesToDelete,
      images,
    } = parsedBody.data

    const queryValues: (string | number)[] = [id]
    let paramIndex = 2
    const queryParts = []

    if (name !== undefined) {
      queryParts.push(`name = $${paramIndex}`)
      queryValues.push(name)
      paramIndex++
    }
    if (description !== undefined) {
      queryParts.push(`description = $${paramIndex}`)
      queryValues.push(description)
      paramIndex++
    }
    if (price !== undefined) {
      queryParts.push(`price = $${paramIndex}`)
      queryValues.push(price)
      paramIndex++
    }
    if (state !== undefined) {
      queryParts.push(`state = $${paramIndex}`)
      queryValues.push(state)
      paramIndex++
    }
    if (category_id !== undefined) {
      queryParts.push(`category_id = $${paramIndex}`)
      queryValues.push(category_id)
      paramIndex++
    }

    let updatedProduct = null
    if (queryParts.length > 0) {
      queryParts.push(`updated_at = CURRENT_TIMESTAMP`)
      const query = `
        UPDATE products
        SET ${queryParts.join(', ')}
        WHERE id = $1
        RETURNING *
      `
      const { rows } = await db.query(query, queryValues)
      if (!rows.length) {
        return response({
          res,
          code: 404,
          message: 'Producto no encontrado o no actualizado',
          data: null,
        })
      }
      updatedProduct = rows[0]
    }

    // 2. Eliminar imágenes si corresponde
    if (
      imagesToDelete &&
      Array.isArray(imagesToDelete) &&
      imagesToDelete.length > 0
    ) {
      await db.query(
        `DELETE FROM products_images 
         WHERE product_id = $1 AND image_id = ANY($2::int[])`,
        [id, imagesToDelete]
      )

      await db.query(`DELETE FROM images WHERE id = ANY($1::int[])`, [
        imagesToDelete,
      ])
    }

    // 3. Agregar nuevas imágenes sin repetir
    if (images && images.length > 0) {
      for (const file of images) {
        const imageUrl = `/uploads/${file}`

        // Verificar si la imagen ya existe
        const imageExistsResult = await db.query(
          `SELECT id FROM images WHERE url = $1`,
          [imageUrl]
        )

        let imageId: number

        if (imageExistsResult.rows.length > 0) {
          // Ya existe la imagen, usar ese id
          imageId = imageExistsResult.rows[0].id
        } else {
          // No existe, insertarla y obtener el id
          const imageResult = await db.query(
            `INSERT INTO images (url) VALUES ($1) RETURNING id`,
            [imageUrl]
          )
          imageId = imageResult.rows[0].id
        }

        // Verificar si ya existe la relación producto-imagen
        const relationExists = await db.query(
          `SELECT 1 FROM products_images WHERE product_id = $1 AND image_id = $2`,
          [id, imageId]
        )
        if (relationExists.rows.length === 0) {
          // Si no existe, crear la relación
          await db.query(
            `INSERT INTO products_images (product_id, image_id) VALUES ($1, $2)`,
            [id, imageId]
          )
        }
      }
      return response({
        res,
        code: 200,
        message:
          'Producto actualizado exitosamente y nuevas imágenes agregadas (sin duplicados)',
        data: updatedProduct,
      })
    } else {
      return response({
        res,
        code: 200,
        message: 'Producto actualizado exitosamente',
        data: updatedProduct,
      })
    }
  } catch (err) {
    console.error(err)
    return response({
      res,
      code: 500,
      message: 'Error interno al actualizar el producto',
      data: null,
    })
  }
}
