import { FastifyInstance } from 'fastify'
import { createProduct, getProduct } from '../controllers/productCtrl'

export async function productRoutes(app: FastifyInstance) {
  app.post('/', createProduct)
  app.get('/:id', getProduct)
}
