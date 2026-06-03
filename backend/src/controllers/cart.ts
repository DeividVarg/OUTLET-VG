import { db } from "../config/db";
import { response } from "../utils/response";
import { Request, Response } from "express";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return response({
        res,
        code: 401,
        message: "Necesitas logearte para ver tu carrito",
        data: null,
      });
    }

    const { rows } = await db.query(
      `
      SELECT
        cp.id AS cart_product_id,
        cp.quantity,
        cp.created_at,
        p.id AS product_id,
        p.name,
        p.price,
        p.stock,
        p.state,
        COALESCE(
          JSON_AGG(
            CASE WHEN i.id IS NOT NULL THEN json_build_object('id', i.id, 'url', i.url) END
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'
        ) AS images
      FROM cart c
      JOIN cart_products cp ON c.id = cp.cart_id
      JOIN products p ON cp.product_id = p.id
      LEFT JOIN products_images pi ON p.id = pi.product_id
      LEFT JOIN images i ON pi.image_id = i.id
      WHERE c.user_id = $1
      AND p.state = 'available'
      AND p.stock > 0
      GROUP BY cp.id, p.id
      `,
      [userId],
    );

    return response({
      res,
      code: 200,
      message: "Cart retrieved successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return response({
      res,
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

// POST — agregar producto al carrito
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const { product_id, quantity = 1 } = req.body;

    if (!userId) {
      console.log("User ID from request:", userId);
      return response({
        res,
        code: 401,
        message: "Necesitas logearte para agregar al carrito",
        data: null,
      });
    }

    if (!product_id) {
      return response({
        res,
        code: 400,
        message: "product_id es requerido",
        data: null,
      });
    }

    // Verificar que el producto existe y tiene stock
    const { rows: productRows } = await db.query(
      "SELECT id, stock, state FROM products WHERE id = $1",
      [product_id],
    );

    if (!productRows.length) {
      return response({
        res,
        code: 404,
        message: "Producto no encontrado",
        data: null,
      });
    }

    if (productRows[0].state !== "available") {
      return response({
        res,
        code: 400,
        message: "Producto no disponible",
        data: null,
      });
    }

    if (productRows[0].stock < quantity) {
      return response({
        res,
        code: 400,
        message: "Stock insuficiente",
        data: null,
      });
    }

    // Obtener o crear el carrito del usuario
    let cartId: string;
    const { rows: cartRows } = await db.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId],
    );

    if (cartRows.length > 0) {
      cartId = cartRows[0].id;
    } else {
      const { rows: newCart } = await db.query(
        "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
        [userId],
      );
      cartId = newCart[0].id;
    }

    // Si el producto ya está en el carrito, sumar la cantidad
    const { rows: existingItem } = await db.query(
      "SELECT id, quantity FROM cart_products WHERE cart_id = $1 AND product_id = $2",
      [cartId, product_id],
    );

    if (existingItem.length > 0) {
      const newQuantity = existingItem[0].quantity + quantity;

      if (newQuantity > productRows[0].stock) {
        return response({
          res,
          code: 400,
          message: "Stock insuficiente",
          data: null,
        });
      }

      const { rows: updated } = await db.query(
        `UPDATE cart_products 
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [newQuantity, existingItem[0].id],
      );

      return response({
        res,
        code: 200,
        message: "Cantidad actualizada en el carrito",
        data: updated[0],
      });
    }

    // Si no existe, insertar
    const { rows: inserted } = await db.query(
      `INSERT INTO cart_products (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [cartId, product_id, quantity],
    );

    return response({
      res,
      code: 201,
      message: "Producto agregado al carrito",
      data: inserted[0],
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return response({
      res,
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params; // cart_product_id
    const { quantity } = req.body;

    if (!userId) {
      return response({ res, code: 401, message: "Unauthorized", data: null });
    }

    if (!quantity || quantity < 1) {
      return response({
        res,
        code: 400,
        message: "La cantidad debe ser mayor a 0",
        data: null,
      });
    }

    // Verificar que el item pertenece al carrito del usuario
    const { rows } = await db.query(
      `
      SELECT cp.id, cp.product_id, p.stock
      FROM cart_products cp
      JOIN cart c ON cp.cart_id = c.id
      JOIN products p ON cp.product_id = p.id
      WHERE cp.id = $1 AND c.user_id = $2
      `,
      [id, userId],
    );

    if (!rows.length) {
      return response({
        res,
        code: 404,
        message: "Item no encontrado en el carrito",
        data: null,
      });
    }

    if (quantity > rows[0].stock) {
      return response({
        res,
        code: 400,
        message: "Stock insuficiente",
        data: null,
      });
    }

    const { rows: updated } = await db.query(
      `UPDATE cart_products 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [quantity, id],
    );

    return response({
      res,
      code: 200,
      message: "Cantidad actualizada",
      data: updated[0],
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return response({
      res,
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

// DELETE — eliminar un producto del carrito
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params; // cart_product_id

    if (!userId) {
      return response({ res, code: 401, message: "Unauthorized", data: null });
    }

    // Verificar que el item pertenece al carrito del usuario
    const { rows } = await db.query(
      `
      SELECT cp.id FROM cart_products cp
      JOIN cart c ON cp.cart_id = c.id
      WHERE cp.id = $1 AND c.user_id = $2
      `,
      [id, userId],
    );

    if (!rows.length) {
      return response({
        res,
        code: 404,
        message: "Item no encontrado en el carrito",
        data: null,
      });
    }

    await db.query("DELETE FROM cart_products WHERE id = $1", [id]);

    return response({
      res,
      code: 200,
      message: "Producto eliminado del carrito",
      data: null,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return response({
      res,
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

// DELETE — vaciar carrito completo
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return response({ res, code: 401, message: "Unauthorized", data: null });
    }

    const { rows: cartRows } = await db.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId],
    );

    if (!cartRows.length) {
      return response({
        res,
        code: 404,
        message: "Carrito no encontrado",
        data: null,
      });
    }

    await db.query("DELETE FROM cart_products WHERE cart_id = $1", [
      cartRows[0].id,
    ]);

    return response({ res, code: 200, message: "Carrito vaciado", data: null });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return response({
      res,
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};
