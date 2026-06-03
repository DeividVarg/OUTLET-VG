// src/routes/payment.ts
import { Router } from "express";
import { authenticate } from "../middleware/Autenticate";
import { initPayment, returnPayment } from "../controllers/payment";
import {
  initPaymentMP,
  returnPaymentMP,
  webhookMP,
} from "../controllers/paymentMP";

export const PaymentRouter = Router();

// ── Transbank ──────────────────────────────────────────────────────────────
PaymentRouter.post("/init", authenticate, initPayment);
PaymentRouter.get("/return", returnPayment);

// ── MercadoPago ────────────────────────────────────────────────────────────
PaymentRouter.post("/mp/init", authenticate, initPaymentMP);
PaymentRouter.get("/mp/return", returnPaymentMP);
PaymentRouter.post("/mp/webhook", webhookMP);
