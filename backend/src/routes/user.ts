import { Router } from "express";

import {
  getUsers,
  getUserById,
  getUserByEmail,
  login,
  logout,
  updateUser,
  Register,
  deleteUser,
  RegisterAuth,
  me,
  verifyLogin,
  resetPassword,
  forgotPassword,
} from "../controllers/users";

import { authenticate } from "../middleware/Autenticate";
import { authorizeAction } from "../middleware/checkAutoritation";

export const UserRouter = Router();

UserRouter.get("/", getUsers);
UserRouter.get("/:id", getUserById);
UserRouter.get("/email/:email", getUserByEmail);

UserRouter.get("/auth/me", me);

UserRouter.post("/login", login);
UserRouter.post("/login", login);
UserRouter.post("/login/verify", verifyLogin);

UserRouter.post("/logout", logout);

UserRouter.post("/register", Register);

UserRouter.post("/forgot-password", forgotPassword);
UserRouter.post("/reset-password", resetPassword);

UserRouter.post(
  "/register/auth",
  authenticate,
  authorizeAction("create", "fromBody"),
  RegisterAuth,
);

UserRouter.patch(
  "/:id",
  authenticate,
  authorizeAction("update", "fromBody"),
  updateUser,
);

UserRouter.delete("/:id", authenticate, deleteUser);
