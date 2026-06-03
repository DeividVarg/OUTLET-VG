import { Router } from "express";
import {
  GetSubCategories,
  GetSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategory";

export const subCategoryRouter = Router();

subCategoryRouter.get("/", GetSubCategories);
subCategoryRouter.get("/:id", GetSubCategoryById);
subCategoryRouter.post("/", createSubCategory);
subCategoryRouter.patch("/:id", updateSubCategory);
subCategoryRouter.delete("/:id", deleteSubCategory);
