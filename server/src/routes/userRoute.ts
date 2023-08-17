import { FastifyInstance } from 'fastify'

import {
  blockUser,
  deleteUser,
  getUser,
  getUsers,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  unblockUser,
  updateUser,
} from '../controllers/userCtrl'
import { authMiddleware, isAdmin } from '../middleware/authMiddleware'

export async function userRoutes(app: FastifyInstance) {
  app.get('/:id', getUser)
  app.get('/all', getUsers)
  app.get('/refresh', { preHandler: [authMiddleware, isAdmin] }, refreshToken)
  app.post('/register', registerUser)
  app.post('/login', loginUser)
  app.get('/logout', logoutUser)
  app.delete('/:id', deleteUser)
  app.put('/:id', updateUser)
  app.put(
    '/block-user/:id',
    { preHandler: [authMiddleware, isAdmin] },
    blockUser,
  )
  app.put(
    '/unblock-user/:id',
    { preHandler: [authMiddleware, isAdmin] },
    unblockUser,
  )
}
