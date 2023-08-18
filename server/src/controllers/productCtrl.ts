import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import { prisma } from '../lib/prisma'
import productSchema from '../schemas/productSchema'

type UserParams = {
  id: string
}

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

export const getProduct: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as UserParams

  try {
    const findProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    })

    reply.send({ findProduct })
  } catch (error) {
    return reply.send({ message: error })
  }
}

export const getAllProducts: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const getAllProducts = await prisma.product.findMany()

    return reply.send(getAllProducts)
  } catch (error) {
    return reply.send({ message: error })
  }
}
