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
      email: z.string(),
    })
  })
}
