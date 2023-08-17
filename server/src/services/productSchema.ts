import z from 'zod'

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
  category: z
    .string({
      required_error: 'Category is required',
      invalid_type_error: 'Category must be a string',
    })
    .min(1),
  brand: z
    .string({
      required_error: 'Brand is required',
      invalid_type_error: 'Brand must be a string',
    })
    .min(1),
  quantity: z.number(),
  sold: z.number().default(0),
  images: z.array(z.string()),
  color: z.string().min(1),
  ratings: z.array(z.string()),
  totalRatings: z.number().default(0),
})

export default productSchema
