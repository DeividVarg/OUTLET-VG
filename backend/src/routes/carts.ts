import { Router } from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart";

import { authenticate } from "../middleware/Autenticate";

export const cartRouter = Router();

cartRouter.get("/", authenticate, getCart);
cartRouter.post("/", authenticate, addToCart);
cartRouter.patch("/:id", authenticate, updateCartItem);
cartRouter.delete("/clear", authenticate, clearCart);
cartRouter.delete("/:id", authenticate, removeFromCart);
