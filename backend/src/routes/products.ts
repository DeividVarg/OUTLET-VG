import { product } from "./../types/models";
import { upload, convertToWebP } from "../config/multer";
import {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  deleteProduct,
  getProductByCategory,
  getProductBySubCategory,
  getProductsAvailable,
} from "../controllers/products";
import { Router } from "express";

export const productRouter = Router();

productRouter.get("/", getProducts);
productRouter.get("/available", getProductsAvailable);
productRouter.get("/:id_category", getProductByCategory);
productRouter.get("/productDetail/:id", getProductById);
productRouter.get("/subcategory/:id_subcategory", getProductBySubCategory);

productRouter.post(
  "/",

  upload.array("images", 5),
  convertToWebP,
  createProduct,
);

productRouter.patch(
  "/:id",

  upload.array("images", 5),
  convertToWebP,
  updateProduct,
);

productRouter.delete("/:id", deleteProduct);
