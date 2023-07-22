import z from 'zod'

const userSchema = z.object({
  firstname: z
    .string({
      required_error: 'Firstname is required',
      invalid_type_error: 'Title must be a string',
    })
    .nonempty(),
  lastname: z
    .string({
      required_error: 'Lastname is require',
      invalid_type_error: 'Title must be a string',
    })
    .nonempty(),
  mobile: z.string().min(6).max(14),
  password: z.string().min(6),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email({ message: 'Invalid email address' }),
  role: z.string().nonempty(),
  cart: z.string().default(' '),
  address: z.string(),
})

export default userSchema
