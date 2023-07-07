import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany()

    reply.send({ users })
  })

  app.post('/users', async (request, reply) => {
    const userSchema = z.object({
      firstname: z.string().min(1),
      lastname: z.string().min(1),
      mobile: z.string().min(6).max(14),
      password: z.string(),
      email: z.string(),
    })

    const userInfo = userSchema.parse(request.body)

    let user = await prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          firstname: userInfo.firstname,
          lastname: userInfo.lastname,
          mobile: userInfo.mobile,
          password: userInfo.password,
          email: userInfo.email,
        },
      })
    } else {
      reply.code(409).send({ message: 'User already exists', success: false })
    }

    return user
  })
}
