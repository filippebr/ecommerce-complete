import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import { prisma } from '../lib/prisma'

export const createProduct: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const newProduct = await prisma.product.create({})
    return reply.send({ message: `Hey it's a product post route` })
  } catch (error) {
    return reply.send({ message: error })
  }
}
