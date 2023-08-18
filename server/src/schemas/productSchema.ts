import z from 'zod'
import ratingSchema from './ratingSchema'

const productSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required',
      invalid_type_error: 'Title must be a string',
    })
    .min(1),
  slug: z
    .string({
      required_error: 'Slug is required',
    })
    .min(1),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string',
    })
    .min(1),
  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .positive(),
  category: z.string().optional(),
  brand: z.string().optional(),
  quantity: z.number(),
  sold: z.number().default(0),
  images: z.string().optional(),
  color: z.string().optional(),
  rating: z.array(ratingSchema).optional(),
  totalRatings: z.number().default(0).optional(),
})

export default productSchema
