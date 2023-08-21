import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import slugify from 'slugify'
import { prisma } from '../lib/prisma'
import productSchema from '../schemas/productSchema'

type ProductParams = {
  id: string
}

export const createProduct: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const productInfo = productSchema.parse(request.body)

    if (productInfo.title) {
      productInfo.slug = slugify(productInfo.title)
    }

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

    return reply.send({
      message: 'New product create with success',
      newProduct,
    })
  } catch (error) {
    return reply.send({ message: error })
  }
}

export const deleteProduct: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as ProductParams

    const deleteProduct = await prisma.product.delete({
      where: { id },
    })

    return reply.send({
      message: 'Product deleted with success',
      deleteProduct,
    })
  } catch (error) {
    return reply.send({ message: 'Product not found', success: false })
  }
}

export const updateProduct: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as ProductParams

    const productInfo = productSchema.parse(request.body)

    if (productInfo.title) {
      productInfo.slug = slugify(productInfo.title)
    }

    const updateProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        title: productInfo?.title,
        slug: productInfo?.slug,
        description: productInfo?.description,
        price: productInfo?.price,
        category: productInfo?.category,
        brand: productInfo?.brand,
        quantity: productInfo?.quantity,
        sold: productInfo?.sold,
        images: productInfo?.images,
        color: productInfo?.color,
      },
    })

    return reply.send({
      message: 'Product updated with success',
      updateProduct,
    })
  } catch (error) {
    return reply.send({ message: error })
  }
}

export const getProduct: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as ProductParams
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
    const products = await prisma.product.findMany()

    return reply.send({ products })
  } catch (error) {
    return reply.send({ message: error })
  }
}
