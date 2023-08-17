import z from 'zod'
import cartSchema from './cartSchema'
import productSchema from './productSchema'

const validRoles = ['admin', 'user']

const userSchema = z.object({
  firstname: z
    .string({
      required_error: 'Firstname is required',
      invalid_type_error: 'Firstname must be a string',
    })
    .nonempty(),
  lastname: z
    .string({
      required_error: 'Lastname is require',
      invalid_type_error: 'Lastname must be a string',
    })
    .nonempty(),
  mobile: z.string().min(6).max(14),
  password: z.string().min(6),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email({ message: 'Invalid email address' }),
  role: z
    .string()
    .nonempty()
    .refine((value) => validRoles.includes(value), {
      message: 'Invalid role value',
    }),
  isBlocked: z.boolean().optional(),
  address: z.string().optional(),
  cart: z.array(cartSchema).optional(),
  wishlist: z.array(productSchema).optional(),
})

export default userSchema
