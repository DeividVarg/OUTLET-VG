import { categoryModel } from '../models/category'
import { productModel } from '../models/product'
import { userModel } from '../models/user'

export const createDb = async () => {
  try {
    await categoryModel()
    await productModel()
    await userModel()

    console.log('Tables created successfully')
  } catch (error) {
    console.error('Error creating tables:', error)
  }
}
