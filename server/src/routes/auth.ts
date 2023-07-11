import bcrypt from 'bcrypt'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    throw new Error('Sample Error')
  })

  app.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany()

    reply.send({ users })
  })

  app.post('/users', async (request, reply) => {
    const userSchema = z.object({
      firstname: z
        .string({
          required_error: 'Firstname is required',
          invalid_type_error: 'Title must be a string',
        })
        .min(1),
      lastname: z
        .string({
          required_error: 'Lastname is require',
          invalid_type_error: 'Title must be a string',
        })
        .min(1),
      mobile: z.string().min(6).max(14),
      password: z.string().min(8),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email({ message: 'Invalid email address' }),
    })

    try {
      const userInfo = userSchema.parse(request.body)
      const saltRounds = 10
      const salt = bcrypt.genSaltSync(saltRounds)
      const passwordHashed = bcrypt.hashSync(userInfo.password, salt)

      const match = await bcrypt.compare(userInfo.password, passwordHashed)

      let user = await prisma.user.findUnique({
        where: {
          email: userInfo.email,
        },
      })

      if (!match)
        return reply
          .code(409)
          .send({ message: 'Password not matched', success: false })

      if (user)
        return reply
          .code(409)
          .send({ message: 'User already exists', success: false })

      user = await prisma.user.create({
        data: {
          firstname: userInfo.firstname,
          lastname: userInfo.lastname,
          mobile: userInfo.mobile,
          password: passwordHashed,
          email: userInfo.email,
        },
      })

      return reply.status(200).send({
        success: true,
        createdUser: user,
      })
    } catch (error) {
      reply.send(error)
    }
  })
}
