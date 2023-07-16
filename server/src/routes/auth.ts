import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import generateJsonWebToken from '../config/jwtToken'
import { prisma } from '../lib/prisma'
import BcryptService from '../services/bcryptService'

export async function authRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    reply.send('404 Page not Found')
  })

  app.get('/users', async (request, reply) => {
    try {
      const users = await prisma.user.findMany()
      reply.send({ users })
    } catch (error) {
      reply.send(error)
    }
  })

  app.post('/users/register', async (request, reply) => {
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
      password: z.string().min(6),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email({ message: 'Invalid email address' }),
    })

    try {
      const userInfo = userSchema.parse(request.body)
      const passwordHashed = BcryptService.hashPassword(userInfo.password)

      const match = BcryptService.comparePassword(
        userInfo.password,
        passwordHashed,
      )

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

  app.post('/users/login', async (request, reply) => {
    const userSchema = z.object({
      password: z.string().min(6),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email({ message: 'Invalid email address' }),
    })

    const userInfo = userSchema.parse(request.body)
    const passwordHashed = BcryptService.hashPassword(userInfo.password)

    console.log('userInfo.password: ', userInfo.password)
    console.log('passwordHashed: ', passwordHashed)

    const user = await prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
    })

    const match = BcryptService.comparePassword(
      userInfo.password,
      passwordHashed,
    )

    console.log('match: ', match)

    if (!user)
      return reply
        .code(409)
        .send({ message: 'Email not found', success: false })

    if (!match)
      return reply
        .code(409)
        .send({ message: 'Invalid password', success: false })

    reply.send({
      _id: user?.id,
      firstname: user?.firstname,
      lastname: user?.lastname,
      email: user?.email,
      mobile: user?.mobile,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
      token: generateJsonWebToken(user),
    })
  })
}
