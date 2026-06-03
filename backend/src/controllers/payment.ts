// src/controllers/payment.ts
import { db } from "../config/db";
import { response } from "../utils/response";
import { Request, Response } from "express";
import { webpay } from "../config/transbank";
import { sendEmail } from "../utils/resend";
import {
  orderConfirmationTemplate,
  internalOrderNotificationTemplate,
  paymentFailedTemplate,
} from "../templates/templates";

// POST /payments/init — inicia la transacción Transbank
export const initPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return response({ res, code: 401, message: "Unauthorized", data: null });
    }

    const { purchase_id } = req.body;
    if (!purchase_id) {
      return response({
        res,
        code: 400,
        message: "purchase_id es requerido",
        data: null,
      });
    }

    const { rows: purchaseRows } = await db.query(
      "SELECT id, total, status FROM purchases WHERE id = $1 AND user_id = $2",
      [purchase_id, userId],
    );

    if (!purchaseRows.length) {
      return response({
        res,
        code: 404,
        message: "Compra no encontrada",
        data: null,
      });
    }

    if (purchaseRows[0].status !== "pending") {
      return response({
        res,
        code: 400,
        message: "Esta compra ya fue procesada",
        data: null,
      });
    }

    const purchase = purchaseRows[0];
    const buyOrder = `o${purchase_id.slice(0, 8)}${Date.now().toString().slice(-8)}`;
    const sessionId = `s${userId.slice(0, 8)}${Date.now().toString().slice(-8)}`;
    const returnUrl = `${process.env.BACKEND_URL}/payments/return`;

    const transbankResponse = await webpay.create(
      buyOrder,
      sessionId,
      Number(purchase.total),
      returnUrl,
    );

    await db.query(
      `INSERT INTO payments (purchase_id, provider, token, amount, status)
       VALUES ($1, 'transbank', $2, $3, 'initiated')`,
      [purchase_id, transbankResponse.token, purchase.total],
    );

    return response({
      res,
      code: 200,
      message: "Transacción iniciada",
      data: {
        url: transbankResponse.url,
        token: transbankResponse.token,
      },
    });
  } catch (err) {
    console.error("Error iniciando pago:", err);
    return response({
      res,
      code: 500,
      message: "Error iniciando pago",
      data: null,
    });
  }
};

// GET /payments/return — Transbank redirige aquí después del pago
export const returnPayment = async (req: Request, res: Response) => {
  try {
    const { token_ws, TBK_TOKEN } = req.query;

    if (TBK_TOKEN && !token_ws) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/purchase/failed?reason=cancelled`,
      );
    }

    if (!token_ws && !TBK_TOKEN) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/purchase/failed?reason=timeout`,
      );
    }

    const token = token_ws as string;
    const confirmation = await webpay.commit(token);

    const { rows: paymentRows } = await db.query(
      "SELECT id, purchase_id FROM payments WHERE token = $1",
      [token],
    );

    if (!paymentRows.length) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/purchase/failed?reason=not_found`,
      );
    }

    const { id: paymentId, purchase_id } = paymentRows[0];

    const { rows: purchaseData } = await db.query(
      `SELECT pu.total, pu.direction, pu.phone,
              u.email, u.name,
              JSON_AGG(json_build_object(
                'name', p.name,
                'quantity', pp.quantity,
                'unit_price', pp.unit_price
              )) AS products
       FROM purchases pu
       JOIN users u ON pu.user_id = u.id
       JOIN purchase_products pp ON pu.id = pp.purchase_id
       JOIN products p ON pp.product_id = p.id
       WHERE pu.id = $1
       GROUP BY pu.id, u.email, u.name`,
      [purchase_id],
    );

    const pd = purchaseData[0];
    const internalEmail = process.env.INTERNAL_EMAIL as string;

    const { rows: purchaseProducts } = await db.query(
      "SELECT product_id, quantity FROM purchase_products WHERE purchase_id = $1",
      [purchase_id],
    );

    if (confirmation.status === "AUTHORIZED") {
      await db.query(
        `UPDATE payments SET
          status = $1, authorization_code = $2,
          payment_type = $3, card_last_four = $4, raw_response = $5
         WHERE id = $6`,
        [
          confirmation.status,
          confirmation.authorization_code,
          confirmation.payment_type_code,
          confirmation.card_detail?.card_number,
          JSON.stringify(confirmation),
          paymentId,
        ],
      );

      await db.query(
        "UPDATE purchases SET status = 'confirmed' WHERE id = $1",
        [purchase_id],
      );

      for (const item of purchaseProducts) {
        await db.query(
          `UPDATE products
           SET state = CASE WHEN stock <= 0 THEN 'not available' ELSE state END
           WHERE id = $1`,
          [item.product_id],
        );
      }

      if (pd) {
        sendEmail({
          to: pd.email,
          subject: "✅ Pago confirmado — Tu pedido está en camino",
          html: orderConfirmationTemplate({
            userName: pd.name,
            purchaseId: purchase_id,
            items: pd.products,
            total: Number(pd.total),
            direction: pd.direction,
            phone: pd.phone,
          }),
        }).catch((err) => console.error("Error enviando correo cliente:", err));

        if (process.env.STATE === "local") {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        sendEmail({
          to: internalEmail,
          subject:
            "🛒 Nueva compra — " +
            pd.name +
            " — $" +
            Number(pd.total).toLocaleString("es-CL"),
          html: internalOrderNotificationTemplate({
            userName: pd.name,
            userEmail: pd.email,
            purchaseId: purchase_id,
            items: pd.products,
            total: Number(pd.total),
            direction: pd.direction,
            phone: pd.phone,
            purchaseType: "cart",
          }),
        }).catch((err) => console.error("Error enviando correo interno:", err));
      }

      return res.redirect(
        `${process.env.FRONTEND_URL}/purchase/success?id=${purchase_id}`,
      );
    } else {
      await db.query(
        `UPDATE payments SET status = $1, raw_response = $2 WHERE id = $3`,
        [confirmation.status, JSON.stringify(confirmation), paymentId],
      );

      await db.query(
        "UPDATE purchases SET status = 'cancelled' WHERE id = $1",
        [purchase_id],
      );

      for (const item of purchaseProducts) {
        await db.query(
          `UPDATE products
           SET stock = stock + $1,
               state = CASE WHEN (stock + $1) > 0 THEN 'available' ELSE state END
           WHERE id = $2`,
          [item.quantity, item.product_id],
        );
      }

      if (pd) {
        sendEmail({
          to: pd.email,
          subject: "❌ Tu pago no pudo procesarse",
          html: paymentFailedTemplate({
            userName: pd.name,
            purchaseId: purchase_id,
            reason: confirmation.status,
          }),
        }).catch((err) => console.error("Error enviando correo rechazo:", err));
      }

      return res.redirect(
        `${process.env.FRONTEND_URL}/purchase/failed?reason=rejected`,
      );
    }
  } catch (err) {
    console.error("Error confirmando pago:", err);
    return res.redirect(
      `${process.env.FRONTEND_URL}/purchase/failed?reason=error`,
    );
  }
};
