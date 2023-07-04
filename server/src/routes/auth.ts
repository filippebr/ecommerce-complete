import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany()

    reply.send({ users })
  })

  app.post('/users', async (request) => {
    const bodySchema = z.object({
      firstname: z.string(),
      lastname: z.string(),
      mobile: z.string(),
      password: z.string(),
      email: z.string(),
    })

    const { firstname, lastname, email, mobile, password } = bodySchema.parse(
      request.body,
    )

    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        mobile,
        password,
      },
    })

    return user
  })
}
