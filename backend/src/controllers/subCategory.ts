import { db } from "../config/db";
import { response } from "../utils/response";
import { Request, Response } from "express";
import {
  CreateSubCategorySchema,
  UpdateSubCategorySchema,
} from "../schemas/subCategory";

export const GetSubCategories = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(
      "SELECT id , name, category_id FROM subcategories",
    );
    if (!rows) {
      return response({
        res,
        code: 404,
        message: "subcategories not found",
        data: null,
      });
    }
    return response({
      res,
      code: 200,
      message: "subcategories found succesfully",
      data: rows,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error when trying found subcategories",
      data: null,
    });
  }
};

export const GetSubCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      "SELECT id , name, category_id FROM subcategories WHERE id = $1",
      [id],
    );
    if (!rows) {
      return response({
        res,
        code: 404,
        message: "category not found",
        data: null,
      });
    }
    return response({
      res,
      code: 200,
      message: "category found succesfully",
      data: rows,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying found category",
      data: null,
    });
  }
};

export const GetSubCategoryByCategory = async (req: Request, res: Response) => {
  try {
    const { id_category } = req.params;
    const { rows } = await db.query(
      "SELECT id , name, category_id FROM subcategories WHERE category_id = $1",
      [id_category],
    );
    if (!rows) {
      return response({
        res,
        code: 404,
        message: "subcategory not found",
        data: null,
      });
    }
    return response({
      res,
      code: 200,
      message: "subcategory found succesfully",
      data: rows,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying found subcategory",
      data: null,
    });
  }
};

export const createSubCategory = async (req: Request, res: Response) => {
  try {
    const result = CreateSubCategorySchema.safeParse(req.body);

    if (!result.success) {
      console.log(result.error);
      return response({
        res,
        code: 400,
        message: "Invalid subcategory data",
        data: result.error.errors,
      });
    }

    const { name, id_category } = result.data;

    const categoryExists = await db.query(
      "SELECT * FROM categories WHERE id = $1",
      [id_category],
    );

    if (categoryExists.rowCount === 0) {
      return response({
        res,
        code: 400,
        message: "Invalid category id",
        data: null,
      });
    }

    const { rows } = await db.query(
      "INSERT INTO subcategories (name, category_id) VALUES ($1, $2) RETURNING *",
      [name, id_category],
    );

    return response({
      res,
      code: 200,
      message: "subcategory created succesfully",
      data: rows[0],
    });
  } catch (err) {
    console.error(err);
    return response({
      res,
      code: 500,
      message: "error trying create subcategory",
      data: null,
    });
  }
};

export const updateSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = UpdateSubCategorySchema.safeParse(req.body);

    if (!result.success) {
      return response({
        res,
        code: 400,
        message: "Invalid subcategory data",
        data: result.error.errors,
      });
    }

    const { name, id_category } = result.data;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (id_category !== undefined) {
      updates.push(`category_id = $${paramIndex}`);
      values.push(id_category);
      paramIndex++;
    }

    if (updates.length === 0) {
      return response({
        res,
        code: 500,
        message: "error trying update subcategories",
        data: null,
      });
    }

    values.push(id);

    const query = `
      UPDATE subcategories 
      SET ${updates.join(", ")}, updated_at = NOW() 
      WHERE id = $${paramIndex}
    `;

    const { rows } = await db.query(query, values);

    return response({
      res,
      code: 200,
      message: "subcategory updated succesfully",
      data: rows,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying update subcategory",
      data: null,
    });
  }
};

export const deleteSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query("DELETE FROM subcategories WHERE id = $1", [
      id,
    ]);

    return response({
      res,
      code: 200,
      message: "subcategory deleted succesfully",
      data: rows,
    });
  } catch (err) {
    return response({
      res,
      code: 500,
      message: "error trying delete subcategory",
      data: null,
    });
  }
};
