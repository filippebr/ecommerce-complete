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
    const queryObj = request.query as any
    const filter = { ...queryObj }
    const excludeFields = ['page', 'sort', 'limit', 'fields']
    excludeFields.forEach((el) => delete queryObj[el])

    console.log('filter: ', filter)

    let queryStr = JSON.stringify(queryObj)

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

    const products = await prisma.product.findMany({
      where: JSON.parse(queryStr),
    })

    console.log('products: ', products)

    // const getAllProducts = await prisma.product.findMany({
    //   where: {},
    // })

    return reply.send(getAllProducts)
  } catch (error) {
    return reply.send({ message: error })
  }
}
