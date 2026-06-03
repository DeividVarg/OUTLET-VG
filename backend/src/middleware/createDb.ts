import { categoryModel } from "../models/category";
import { productModel } from "../models/product";
import { userModel } from "../models/user";
import { cartModel } from "../models/cart";
import { purchaseModel } from "../models/pucharse";

export const createDb = async () => {
  try {
    await categoryModel();
    await productModel();
    await userModel();
    await cartModel();
    await purchaseModel();
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};
