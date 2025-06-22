import { upload, convertToWebP } from '../config/multer'
import {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  deleteProduct,
  getProductByCategory,
} from '../controllers/products'
import { Router } from 'express'

export const productRouter = Router()

productRouter.get('/', getProducts)
productRouter.get('/:id', getProductById)
productRouter.get('/category/:id_category', getProductByCategory)

productRouter.post('/', upload.array('images', 5), convertToWebP, createProduct)

productRouter.patch(
  '/:id',
  upload.array('images', 5),
  convertToWebP,
  updateProduct
)

productRouter.delete('/:id', deleteProduct)
