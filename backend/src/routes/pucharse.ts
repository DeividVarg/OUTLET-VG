import { Router } from "express";
import { authenticate } from "../middleware/Autenticate";
import { authorizeAction } from "../middleware/checkAutoritation";

import {
  getPurchases,
  updatePurchaseStatus,
  getMyPurchases,
  createPurchase,
} from "../controllers/pucharse";

export const PurchaseRouter = Router();

PurchaseRouter.get(
  "/",
  authenticate,
  getPurchases,
);
PurchaseRouter.get("/my", authenticate, getMyPurchases);
PurchaseRouter.post("/", authenticate, createPurchase);
PurchaseRouter.patch(
  "/:id",
  authenticate,
  authorizeAction("update", "purchase"),
  updatePurchaseStatus,
);
