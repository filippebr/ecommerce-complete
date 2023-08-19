import { FastifyInstance } from 'fastify'
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from '../controllers/productCtrl'

export async function productRoutes(app: FastifyInstance) {
  app.post('/', createProduct)
  app.delete('/:id', deleteProduct)
  app.put('/:id', updateProduct)
  app.get('/:id', getProduct)
  app.get('/', getAllProducts)
}
