import z from 'zod'

const productSchema = z.object({
  id: z.number(),
  // ... Add other properties specific to Product if needed
})

export default productSchema
