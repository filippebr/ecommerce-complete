import { FastifyInstance } from 'fastify'
import { createProduct } from '../controllers/productCtrl'

export async function productRoutes(app: FastifyInstance) {
  app.post('/', createProduct)
}
