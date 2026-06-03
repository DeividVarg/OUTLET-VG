import { db } from "../config/db";
import { response } from "../utils/response";
import { Request, Response } from "express";
import {
  productoSchema,
  updateProductoSchema,
  productByCategorySchema,
  productBySubCategorySchema,
} from "../schemas/products";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const preprocessedData = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      subcategory_id: req.body.subcategory_id.trim(),
      category_id: req.body.category_id.trim(),
      images: req.body.images,
    };

    const result = productoSchema.safeParse(preprocessedData);

    if (!result.success) {
      return response({
        res,
        code: 400,
        message: "Invalid product data",
        data: result.error.errors,
      });
    }

    const {
      name,
      description,
      price,
      stock,
      state,
      category_id,
      subcategory_id,
      images,
    } = result.data;

    const { rows } = await db.query(
      `INSERT INTO products (name, description, price, stock, state, category_id, subcategory_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       RETURNING id`,
      [name, description, price, stock, state, category_id, subcategory_id],
    );

    if (!rows || !rows[0]) {
      return response({
        res,
        code: 400,
        message: "Product not created",
        data: null,
      });
    }

    const productId = rows[0].id;

    if (images && images.length > 0) {
      for (const file of images) {
        const imageUrl = `/uploads/${file}`;
        const imageResult = await db.query(
          `INSERT INTO images (url) VALUES ($1) RETURNING id`,
          [imageUrl],
        );
        await db.query(
          `INSERT INTO products_images (product_id, image_id) VALUES ($1, $2)`,
          [productId, imageResult.rows[0].id],
        );
      }
    }

    return response({
      res,
      code: 201,
      message: "Product created successfully",
      data: { ...rows[0] },
    });
  } catch (err) {
    console.error("Error:", err);
    return response({
      res,
      code: 500,
      message: "Error trying to create product",
      data: null,
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.stock,
        p.price,
        p.state,
        p.category_id,
        p.subcategory_id,
        c.name AS category_name,
        s.name AS subcategory_name,
        p.created_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN i.id IS NOT NULL THEN json_build_object('id', i.id, 'url', i.url) END
          ) FILTER (WHERE i.id IS NOT NULL), 
          '[]'
        ) AS images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      GROUP BY p.id, c.name, p.category_id, p.subcategory_id, s.name
    `);

    return response({
      res,
      code: 200,
      message: "products retrieved successfully",
      data: rows,
    });
  } catch (err) {
    console.error(err);
    return response({
      res,
      code: 500,
      message: "error trying to retrieve products",
      data: null,
    });
  }
};

export const getProductsAvailable = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.stock,
        p.price,
        p.state,
        p.category_id,
        p.subcategory_id,
        c.name AS category_name,
        s.name AS subcategory_name,
        p.created_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN i.id IS NOT NULL THEN json_build_object('id', i.id, 'url', i.url) END
          ) FILTER (WHERE i.id IS NOT NULL), 
          '[]'
        ) AS images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      WHERE p.state = 'available'
      GROUP BY p.id, c.name, p.category_id, p.subcategory_id, s.name
    `);

    return response({
      res,
      code: 200,
      message: "products retrieved successfully",
      data: rows,
    });
  } catch (err) {
    console.error(err);
    return response({
      res,
      code: 500,
      message: "error trying to retrieve products",
      data: null,
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.stock,
        p.price,
        p.state,
        p.category_id,
        p.subcategory_id,
        c.name AS category_name,
        s.name AS subcategory_name,
        p.created_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN i.id IS NOT NULL THEN json_build_object('id', i.id, 'url', i.url) END
          ) FILTER (WHERE i.id IS NOT NULL), 
          '[]'
        ) AS images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      WHERE p.id = $1 
      GROUP BY p.id, c.name, p.category_id, p.subcategory_id, s.name
      `,
      [id],
    );

    if (!rows.length) {
      return response({
        res,
        code: 404,
        message: "product not found",
        data: null,
      });
    }

    return response({
      res,
      code: 200,
      message: "product retrieved successfully",
      data: rows[0],
    });
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    return response({
      res,
      code: 500,
      message: "error trying to retrieve product",
      data: null,
    });
  }
};

export const getProductByCategory = async (req: Request, res: Response) => {
  try {
    const { id_category } = req.params;

    const result = productByCategorySchema.safeParse({ id_category });

    if (result?.error) {
      return response({
        res,
        code: 400,
        message: "ID de categoría inválido",
        data: null,
      });
    }

    const { rows } = await db.query(
      `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.stock,
        p.price,
        p.state,
        p.category_id,
        p.subcategory_id,
        c.name AS category_name,
        s.name AS subcategory_name,
        p.created_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN i.id IS NOT NULL THEN json_build_object('id', i.id, 'url', i.url) END
          ) FILTER (WHERE i.id IS NOT NULL), 
          '[]'
        ) AS images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      WHERE p.category_id = $1 AND p.state = 'available'
      GROUP BY p.id, c.name, p.category_id, p.subcategory_id, s.name
      `,
      [id_category],
    );

    if (!rows.length) {
      return response({
        res,
        code: 404,
        message: "no products found for this category",
        data: [],
      });
    }

    return response({
      res,
      code: 200,
      message: "products retrieved successfully",
      data: rows,
    });
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return response({
      res,
      code: 500,
      message: "error trying to retrieve products",
      data: null,
    });
  }
};

export const getProductBySubCategory = async (req: Request, res: Response) => {
  try {
    const { id_subcategory } = req.params;

    const result = productBySubCategorySchema.safeParse({ id_subcategory });

    if (result?.error) {
      return response({
        res,
        code: 400,
        message: "ID de subcategoría inválido",
        data: null,
      });
    }

    const { rows } = await db.query(
      `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.stock,
        p.price,
        p.state,
        p.category_id,
        p.subcategory_id,
        c.name AS category_name,
        s.name AS subcategory_name,
        p.created_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN i.id IS NOT NULL THEN json_build_object('id', i.id, 'url', i.url) END
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'
        ) AS images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      WHERE p.subcategory_id = $1 AND p.state = 'available'
      GROUP BY p.id, c.name, p.category_id, p.subcategory_id, s.name
      `,
      [id_subcategory],
    );

    if (!rows.length) {
      return response({
        res,
        code: 404,
        message: "no products found for this subcategory",
        data: [],
      });
    }

    return response({
      res,
      code: 200,
      message: "products retrieved successfully",
      data: rows,
    });
  } catch (err) {
    console.error("Error fetching products by subcategory:", err);
    return response({
      res,
      code: 500,
      message: "error trying to retrieve products",
      data: null,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { rowCount } = await db.query(`DELETE FROM products WHERE id = $1`, [
      id,
    ]);

    if (rowCount === 0) {
      return response({
        res,
        code: 404,
        message: "product not found",
        data: null,
      });
    }

    return response({
      res,
      code: 200,
      message: "product deleted successfully",
      data: null,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying to delete product",
      data: null,
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const body = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      stock: req.body.stock ? Number(req.body.stock) : undefined,
      imagesToDelete: req.body.imagesToDelete
        ? Array.isArray(req.body.imagesToDelete)
          ? req.body.imagesToDelete.map(Number)
          : [Number(req.body.imagesToDelete)]
        : [],
    };

    const parsedBody = updateProductoSchema.safeParse(body);
    if (!parsedBody.success) {
      return response({
        res,
        code: 400,
        message: "Datos inválidos",
        data: { errors: parsedBody.error.errors },
      });
    }

    const { id } = req.params;
    const {
      name,
      description,
      stock,
      price,
      state,
      category_id,
      subcategory_id,
      imagesToDelete,
      images,
    } = parsedBody.data;

    const queryValues: (string | number)[] = [id];
    let paramIndex = 2;
    const queryParts: string[] = [];

    if (name !== undefined) {
      queryParts.push(`name = $${paramIndex}`);
      queryValues.push(name);
      paramIndex++;
    }
    if (description !== undefined) {
      queryParts.push(`description = $${paramIndex}`);
      queryValues.push(description);
      paramIndex++;
    }
    if (price !== undefined) {
      queryParts.push(`price = $${paramIndex}`);
      queryValues.push(price);
      paramIndex++;
    }
    if (stock !== undefined) {
      queryParts.push(`stock = $${paramIndex}`);
      queryValues.push(stock);
      paramIndex++;

      // Si no viene state explícito, se calcula automáticamente según el stock
      if (state === undefined) {
        queryParts.push(
          `state = CASE WHEN $${paramIndex - 1} > 0 THEN 'available' ELSE 'not available' END`,
        );
      }
    }
    if (state !== undefined) {
      queryParts.push(`state = $${paramIndex}`);
      queryValues.push(state);
      paramIndex++;
    }
    if (category_id !== undefined) {
      queryParts.push(`category_id = $${paramIndex}`);
      queryValues.push(category_id);
      paramIndex++;
    }
    if (subcategory_id !== undefined) {
      queryParts.push(`subcategory_id = $${paramIndex}`);
      queryValues.push(subcategory_id);
      paramIndex++;
    }

    let updatedProduct = null;
    if (queryParts.length > 0) {
      queryParts.push(`updated_at = CURRENT_TIMESTAMP`);
      const query = `UPDATE products SET ${queryParts.join(", ")} WHERE id = $1 RETURNING *`;
      const { rows } = await db.query(query, queryValues);
      if (!rows.length) {
        return response({
          res,
          code: 404,
          message: "Producto no encontrado",
          data: null,
        });
      }
      updatedProduct = rows[0];
    }

    if (imagesToDelete && imagesToDelete.length > 0) {
      await db.query(
        `DELETE FROM products_images WHERE product_id = $1 AND image_id = ANY($2::int[])`,
        [id, imagesToDelete],
      );
      await db.query(`DELETE FROM images WHERE id = ANY($1::int[])`, [
        imagesToDelete,
      ]);
    }

    if (images && images.length > 0) {
      for (const file of images) {
        const imageUrl = `/uploads/${file}`;

        const imageExistsResult = await db.query(
          `SELECT id FROM images WHERE url = $1`,
          [imageUrl],
        );

        let imageId: number;
        if (imageExistsResult.rows.length > 0) {
          imageId = imageExistsResult.rows[0].id;
        } else {
          const imageResult = await db.query(
            `INSERT INTO images (url) VALUES ($1) RETURNING id`,
            [imageUrl],
          );
          imageId = imageResult.rows[0].id;
        }

        const relationExists = await db.query(
          `SELECT 1 FROM products_images WHERE product_id = $1 AND image_id = $2`,
          [id, imageId],
        );
        if (relationExists.rows.length === 0) {
          await db.query(
            `INSERT INTO products_images (product_id, image_id) VALUES ($1, $2)`,
            [id, imageId],
          );
        }
      }
    }

    return response({
      res,
      code: 200,
      message: "Producto actualizado exitosamente",
      data: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    return response({
      res,
      code: 500,
      message: "Error interno al actualizar el producto",
      data: null,
    });
  }
};
