import { db } from "../config/db";
import { response } from "../utils/response";
import { Request, Response } from "express";
import { updatePucharse } from "../templates/templates";
import { sendEmail } from "../utils/resend";

export const getPurchases = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(`
      SELECT
        pu.id,
        pu.total,
        pu.status,
        pu.phone,
        pu.created_at,
        pu.direction,
        u.name AS user_name,
        u.email AS user_email,
        JSON_AGG(
          json_build_object(
            'productKO68O_id', pp.product_id,
            'name', p.name,
            'quantity', pp.quantity,
            'unit_price', pp.unit_price
          )
        ) AS products
      FROM purchases pu
      JOIN users u ON pu.user_id = u.id
      JOIN purchase_products pp ON pu.id = pp.purchase_id
      JOIN products p ON pp.product_id = p.id
      GROUP BY pu.id, u.name, u.email
      ORDER BY pu.created_at DESC
    `);

    return response({
      res,
      code: 200,
      message: "purchases retrieved successfully",
      data: rows,
    });
  } catch (err) {
    console.error("Error getting purchases:", err);
    return response({
      res,
      code: 500,
      message: "error retrieving purchases",
      data: null,
    });
  }
};

export const getMyPurchases = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return response({ res, code: 401, message: "Unauthorized", data: null });
    }

    const { rows } = await db.query(
      `
      SELECT
        pu.id,
        pu.total,
        pu.status,
        pu.phone,
        pu.created_at,
        JSON_AGG(
          json_build_object(
            'product_id', pp.product_id,
            'name', p.name,
            
            'quantity', pp.quantity,
            'unit_price', pp.unit_price
          )
        ) AS products
      FROM purchases pu
      JOIN purchase_products pp ON pu.id = pp.purchase_id
      JOIN products p ON pp.product_id = p.id
      WHERE pu.user_id = $1
      GROUP BY pu.id
      ORDER BY pu.created_at DESC
      `,
      [userId],
    );

    console.log(rows);

    return response({
      res,
      code: 200,
      message: "purchases retrieved successfully",
      data: rows,
    });
  } catch (err) {
    console.error("Error getting user purchases:", err);
    return response({
      res,
      code: 500,
      message: "error retrieving purchases",
      data: null,
    });
  }
};

export const createPurchase = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return response({ res, code: 401, message: "Unauthorized", data: null });
    }

    const { product_id, quantity = 1, direction, phone } = req.body;

    if (!direction || direction.trim().length < 5) {
      return response({
        res,
        code: 400,
        message: "La dirección es requerida",
        data: null,
      });
    }
    if (!phone || phone.trim().length < 8) {
      return response({
        res,
        code: 400,
        message: "El teléfono es requerido",
        data: null,
      });
    }

    // Verificar que no exista una compra pendiente reciente
    const { rows: existingPurchase } = await db.query(
      `SELECT id FROM purchases 
       WHERE user_id = $1 
       AND status = 'pending' 
       AND created_at > NOW() - INTERVAL '10 minutes'`,
      [userId],
    );

    if (existingPurchase.length) {
      return response({
        res,
        code: 409,
        message: "Ya tienes una compra pendiente de pago",
        data: { id: existingPurchase[0].id },
      });
    }

    let itemsToBuy: any[] = [];

    if (product_id) {
      const { rows: productRows } = await db.query(
        "SELECT id, name, price, stock, state FROM products WHERE id = $1",
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

      itemsToBuy = [
        {
          product_id,
          quantity,
          price: productRows[0].price,
          stock: productRows[0].stock,
          name: productRows[0].name,
          state: productRows[0].state,
        },
      ];
    } else {
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

      const { rows: cartItems } = await db.query(
        `SELECT cp.product_id, cp.quantity, p.price, p.stock, p.name, p.state
         FROM cart_products cp
         JOIN products p ON cp.product_id = p.id
         WHERE cp.cart_id = $1`,
        [cartRows[0].id],
      );

      if (!cartItems.length) {
        return response({
          res,
          code: 400,
          message: "El carrito está vacío",
          data: null,
        });
      }

      itemsToBuy = cartItems;
    }

    for (const item of itemsToBuy) {
      if (item.state !== "available") {
        return response({
          res,
          code: 400,
          message: `El producto "${item.name}" no está disponible`,
          data: null,
        });
      }
      if (item.quantity > item.stock) {
        return response({
          res,
          code: 400,
          message: `Stock insuficiente para "${item.name}"`,
          data: null,
        });
      }
    }

    const total = itemsToBuy.reduce(
      (acc: number, item: any) => acc + Number(item.price) * item.quantity,
      0,
    );

    const { rows: userRows } = await db.query(
      "SELECT email, name FROM users WHERE id = $1",
      [userId],
    );
    const user = userRows[0];

    const { rows: purchaseRows } = await db.query(
      `INSERT INTO purchases (user_id, total, direction, phone) VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, total, direction, phone],
    );

    const purchaseId = purchaseRows[0].id;

    for (const item of itemsToBuy) {
      await db.query(
        `INSERT INTO purchase_products (purchase_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [purchaseId, item.product_id, item.quantity, item.price],
      );

      // Reserva el stock
      await db.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1`,
        [item.quantity, item.product_id],
      );
    }

    // Eliminar del carrito solo los productos comprados
    if (!product_id) {
      const { rows: cartRows } = await db.query(
        "SELECT id FROM cart WHERE user_id = $1",
        [userId],
      );
      if (cartRows.length) {
        const boughtProductIds = itemsToBuy.map((item) => item.product_id);
        await db.query(
          `DELETE FROM cart_products WHERE cart_id = $1 AND product_id = ANY($2::uuid[])`,
          [cartRows[0].id, boughtProductIds],
        );
      }
    }

    return response({
      res,
      code: 201,
      message: "Compra realizada exitosamente",
      data: { id: purchaseId, total },
    });
  } catch (err) {
    console.error("Error creating purchase:", err);
    return response({
      res,
      code: 500,
      message: "error creating purchase",
      data: null,
    });
  }
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const updatePurchaseStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { user_email } = req.body;

    console.log(req.body);

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return response({
        res,
        code: 400,
        message: `Status inválido. Debe ser: ${validStatuses.join(", ")}`,
        data: null,
      });
    }

    const { rows } = await db.query(
      `UPDATE purchases SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id],
    );

    if (!rows.length) {
      return response({
        res,
        code: 404,
        message: "Compra no encontrada",
        data: null,
      });
    }

    const statusLabel = STATUS_LABELS[status] ?? status;

    await sendEmail({
      to: user_email,
      subject: "Actualizacion!",
      html: updatePucharse(statusLabel, id),
    });

    return response({
      res,
      code: 200,
      message: "Status actualizado",
      data: rows[0],
    });
  } catch (err) {
    console.error("Error updating purchase status:", err);
    return response({
      res,
      code: 500,
      message: "error updating purchase",
      data: null,
    });
  }
};
