import z from 'zod'

const ratingSchema = z.object({
  id: z.number(),
})

export default ratingSchema
