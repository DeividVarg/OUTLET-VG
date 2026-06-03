// src/controllers/paymentMP.ts
import { db } from "../config/db";
import { response } from "../utils/response";
import { Request, Response } from "express";
import { Preference, Payment } from "mercadopago";
import { mercadoPago } from "../config/mercadopago";
import { sendEmail } from "../utils/resend";
import {
  orderConfirmationTemplate,
  internalOrderNotificationTemplate,
  paymentFailedTemplate,
} from "../templates/templates";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getPurchaseData(purchase_id: string) {
  const { rows } = await db.query(
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
  return rows[0] ?? null;
}

async function getPurchaseProducts(purchase_id: string) {
  const { rows } = await db.query(
    "SELECT product_id, quantity FROM purchase_products WHERE purchase_id = $1",
    [purchase_id],
  );
  return rows;
}

// ─── POST /payments/mp/init ───────────────────────────────────────────────────

export const initPaymentMP = async (req: Request, res: Response) => {
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

    const { rows: items } = await db.query(
      `SELECT p.name, p.description, pp.quantity, pp.unit_price
       FROM purchase_products pp
       JOIN products p ON pp.product_id = p.id
       WHERE pp.purchase_id = $1`,
      [purchase_id],
    );

    const preference = new Preference(mercadoPago);

    console.log(
      "MP items:",
      JSON.stringify(
        items.map((i) => ({
          ...i,
          unit_price: Number(i.unit_price),
          isNaN: isNaN(Number(i.unit_price)),
        })),
      ),
    );

    const preferenceData = await preference.create({
      body: {
        external_reference: purchase_id,
        items: items.map((item) => ({
          id: purchase_id,
          title: item.name,
          description: item.description ?? item.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          currency_id: "CLP",
        })),
        back_urls: {
          success: `${process.env.BACKEND_URL}/payments/mp/return`,
          failure: `${process.env.BACKEND_URL}/payments/mp/return`,
          pending: `${process.env.BACKEND_URL}/payments/mp/return`,
        },
        auto_return: "approved",
        // Solo incluir notification_url en producción
        ...(process.env.NODE_ENV === "production" && {
          notification_url: `${process.env.BACKEND_URL}/payments/mp/webhook`,
        }),
      },
    });

    await db.query(
      `INSERT INTO payments (purchase_id, provider, token, amount, status)
       VALUES ($1, 'mercadopago', $2, $3, 'initiated')`,
      [purchase_id, preferenceData.id, purchase.total],
    );

    const checkoutUrl =
      process.env.NODE_ENV === "production"
        ? preferenceData.init_point
        : preferenceData.sandbox_init_point;

    return response({
      res,
      code: 200,
      message: "Preferencia creada",
      data: {
        url: checkoutUrl,
        preference_id: preferenceData.id,
      },
    });
  } catch (err) {
    console.error("Error iniciando pago MP:", err);
    return response({
      res,
      code: 500,
      message: "Error iniciando pago",
      data: null,
    });
  }
};

// ─── GET /payments/mp/return ──────────────────────────────────────────────────
// MP redirige aquí con: payment_id, status, external_reference, preference_id

export const returnPaymentMP = async (req: Request, res: Response) => {
  try {
    const { payment_id, status, external_reference } = req.query as Record<
      string,
      string
    >;

    if (!payment_id || !status || !external_reference) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/purchase/failed?reason=invalid_return`,
      );
    }

    const purchase_id = external_reference;

    // Verificar el pago contra la API de MP — nunca confiar solo en query params
    const paymentClient = new Payment(mercadoPago);
    const mpPayment = await paymentClient.get({ id: payment_id });

    const { rows: paymentRows } = await db.query(
      "SELECT id FROM payments WHERE purchase_id = $1 AND provider = 'mercadopago'",
      [purchase_id],
    );

    if (!paymentRows.length) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/purchase/failed?reason=not_found`,
      );
    }

    const paymentDbId = paymentRows[0].id;
    const confirmedStatus = mpPayment.status;

    const pd = await getPurchaseData(purchase_id);
    const purchaseProducts = await getPurchaseProducts(purchase_id);
    const internalEmail = process.env.INTERNAL_EMAIL as string;

    // ── APROBADO ──────────────────────────────────────────────────────────────
    if (confirmedStatus === "approved") {
      await db.query(
        `UPDATE payments SET
          status = $1,
          authorization_code = $2,
          payment_type = $3,
          card_last_four = $4,
          raw_response = $5
         WHERE id = $6`,
        [
          confirmedStatus,
          mpPayment.authorization_code ?? null,
          mpPayment.payment_type_id ?? null,
          mpPayment.card?.last_four_digits ?? null,
          JSON.stringify(mpPayment),
          paymentDbId,
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
        }).catch((err) =>
          console.error("Error enviando correo cliente MP:", err),
        );

        if (process.env.STATE === "local") {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        sendEmail({
          to: internalEmail,
          subject:
            "🛒 Nueva compra (MP) — " +
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
        }).catch((err) =>
          console.error("Error enviando correo interno MP:", err),
        );
      }

      return res.redirect(
        `${process.env.FRONTEND_URL}/purchase/success?id=${purchase_id}`,
      );
    }

    // ── PENDIENTE (transferencia, efectivo, etc.) ─────────────────────────────
    if (confirmedStatus === "pending" || confirmedStatus === "in_process") {
      await db.query(
        `UPDATE payments SET status = $1, raw_response = $2 WHERE id = $3`,
        [confirmedStatus, JSON.stringify(mpPayment), paymentDbId],
      );

      await db.query(
        "UPDATE purchases SET status = 'pending_payment' WHERE id = $1",
        [purchase_id],
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/purchase/pending?id=${purchase_id}`,
      );
    }

    // ── RECHAZADO / CANCELADO ─────────────────────────────────────────────────
    await db.query(
      `UPDATE payments SET status = $1, raw_response = $2 WHERE id = $3`,
      [confirmedStatus, JSON.stringify(mpPayment), paymentDbId],
    );

    await db.query("UPDATE purchases SET status = 'cancelled' WHERE id = $1", [
      purchase_id,
    ]);

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
          reason: confirmedStatus ?? "rejected",
        }),
      }).catch((err) =>
        console.error("Error enviando correo rechazo MP:", err),
      );
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/purchase/failed?reason=rejected`,
    );
  } catch (err) {
    console.error("Error confirmando pago MP:", err);
    return res.redirect(
      `${process.env.FRONTEND_URL}/purchase/failed?reason=error`,
    );
  }
};

// ─── POST /payments/mp/webhook ────────────────────────────────────────────────
// IPN: MP notifica aquí cuando un pago pendiente cambia de estado

export const webhookMP = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (type !== "payment" || !data?.id) {
      return res.sendStatus(200);
    }

    const paymentClient = new Payment(mercadoPago);
    const mpPayment = await paymentClient.get({ id: data.id });

    const purchase_id = mpPayment.external_reference;
    if (!purchase_id) return res.sendStatus(200);

    const { rows: paymentRows } = await db.query(
      "SELECT id, status FROM payments WHERE purchase_id = $1 AND provider = 'mercadopago'",
      [purchase_id],
    );

    if (!paymentRows.length) return res.sendStatus(200);

    const { id: paymentDbId, status: currentStatus } = paymentRows[0];

    // Evitar reprocesar si ya estaba confirmado
    if (currentStatus === "approved") return res.sendStatus(200);

    const newStatus = mpPayment.status;

    await db.query(
      `UPDATE payments SET status = $1, raw_response = $2 WHERE id = $3`,
      [newStatus, JSON.stringify(mpPayment), paymentDbId],
    );

    if (newStatus === "approved") {
      await db.query(
        "UPDATE purchases SET status = 'confirmed' WHERE id = $1",
        [purchase_id],
      );

      const pd = await getPurchaseData(purchase_id);
      const purchaseProducts = await getPurchaseProducts(purchase_id);

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
        }).catch(console.error);
      }
    } else if (newStatus === "rejected" || newStatus === "cancelled") {
      await db.query(
        "UPDATE purchases SET status = 'cancelled' WHERE id = $1",
        [purchase_id],
      );

      const purchaseProducts = await getPurchaseProducts(purchase_id);
      for (const item of purchaseProducts) {
        await db.query(
          `UPDATE products
           SET stock = stock + $1,
               state = CASE WHEN (stock + $1) > 0 THEN 'available' ELSE state END
           WHERE id = $2`,
          [item.quantity, item.product_id],
        );
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Error en webhook MP:", err);
    return res.sendStatus(500);
  }
};
