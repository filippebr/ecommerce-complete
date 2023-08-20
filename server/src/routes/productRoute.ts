import { FastifyInstance } from 'fastify'
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from '../controllers/productCtrl'
import { authMiddleware, isAdmin } from '../middleware/authMiddleware'

export async function productRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [authMiddleware, isAdmin] }, createProduct)
  app.delete('/:id', { preHandler: [authMiddleware, isAdmin] }, deleteProduct)
  app.put('/:id', { preHandler: [authMiddleware, isAdmin] }, updateProduct)
  app.get('/:id', getProduct)
  app.get('/', getAllProducts)
}
