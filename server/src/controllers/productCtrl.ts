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
    const query = request.query as any
    const brand = query.brand // Extract the 'brand' query parameter from the URL

    console.log(brand)

    if (!brand) {
      // Handle the case where the 'brand' parameter is missing
      return reply.status(400).send({ message: 'Brand parameter is missing' })
    }

    const getAllProducts = await prisma.product.findMany({
      where: {
        brand: {
          equals: brand, // Use the extracted 'brand' parameter in the query
        },
      },
    })

    return reply.send(getAllProducts)
  } catch (error) {
    return reply.send({ message: error })
  }
}
