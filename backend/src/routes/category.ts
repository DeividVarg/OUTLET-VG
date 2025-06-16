import { category } from './../../types/models'
import { Router } from 'express'
import {
  GetCategories,
  GetCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category'

export const categoryRouter = Router()

categoryRouter.get('/', GetCategories)
categoryRouter.get('/:id', GetCategoryById)
categoryRouter.post('/', createCategory)
categoryRouter.patch('/:id', updateCategory)
categoryRouter.delete('/:id', deleteCategory)
