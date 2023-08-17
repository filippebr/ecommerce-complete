import z from 'zod'

const cartSchema = z.object({
  id: z.number(),
  // ... Add other properties specific to Cart if needed
})

export default cartSchema
