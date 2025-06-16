import { Router } from 'express'
import {
  getUsers,
  getUserById,
  getUserByEmail,
  login,
  logout,
  updateUser,
  Register,
  deleteUser,
} from '../controllers/users'

export const UserRouter = Router()

UserRouter.get('/', getUsers)
UserRouter.get('/:id', getUserById)
UserRouter.get('/email/:email', getUserByEmail)
UserRouter.post('/login', login)
UserRouter.post('/logout', logout)
UserRouter.post('/register', Register)
UserRouter.patch('/:id', updateUser)
UserRouter.delete('/:id', deleteUser)
