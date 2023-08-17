import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import { prisma } from '../lib/prisma'
import productSchema from '../schemas/productSchema'

export const createProduct: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const productInfo = productSchema.parse(request.body)

    const newProduct = await prisma.product.create({
      data: {
        title: productInfo.title,
        slug: productInfo.slug,
        description: productInfo.description,
        price: productInfo.price,
        category: productInfo.category,
        brand: productInfo.brand,
        quantity: productInfo.quantity,
        sold: productInfo.sold,
        images: productInfo.images,
        color: productInfo.color,
      },
    })
    return reply.send({ message: newProduct })
  } catch (error) {
    return reply.send({ message: error })
  }
}
