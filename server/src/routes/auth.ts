import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import generateJsonWebToken from '../config/jwtToken'
import { prisma } from '../lib/prisma'
import BcryptService from '../services/bcryptService'
import userSchema from '../services/userSchema'

export async function authRoutes(app: FastifyInstance) {
  interface UserParams {
    id: string
  }

  app.get(
    '/user/:id',
    async (
      request: FastifyRequest<{ Params: UserParams }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params

        const user = await prisma.user.findUnique({
          where: {
            id,
          },
        })

        reply.send({ user })
      } catch (error) {
        reply.send(error)
      }
    },
  )

  app.get('/users', async (request, reply) => {
    try {
      const users = await prisma.user.findMany()
      reply.send({ users })
    } catch (error) {
      reply.send(error)
    }
  })

  app.post('/user/register', async (request, reply) => {
    try {
      const userInfo = userSchema.parse(request.body)
      const passwordHashed = BcryptService.hashPassword(userInfo.password)

      if (userInfo.role !== 'admin' && userInfo.role !== 'user')
        return reply.code(409).send({
          message: `The database do not accept '${userInfo.role}' role`,
          success: false,
        })

      let user = await prisma.user.findUnique({
        where: {
          email: userInfo.email,
        },
      })

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
          role: userInfo.role,
          address: userInfo.address,
        },
      })

      return reply.status(200).send({
        success: true,
        createdUser: user,
      })
    } catch (error) {
      reply.send({ message: error })
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

    const user = await prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
    })

    if (user?.password) {
      const match = BcryptService.comparePassword(
        userInfo.password,
        user.password,
      )

      if (!match)
        return reply
          .code(409)
          .send({ message: 'Invalid password', success: false })
    }

    if (!user)
      return reply
        .code(409)
        .send({ message: 'Email not found', success: false })

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

  app.delete(
    '/user/:id',
    async (
      request: FastifyRequest<{ Params: UserParams }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params

        const user = await prisma.user.delete({
          where: {
            id,
          },
        })

        return reply.send({ message: 'User deleted successfully', user })
      } catch (error) {
        return reply.send({ message: 'User not found', success: false })
      }
    },
  )

  app.put(
    '/user/:id',
    async (
      request: FastifyRequest<{ Params: UserParams }>,
      reply: FastifyReply,
    ) => {
      const { id } = request.params

      try {
        const userInfo = userSchema.parse(request.body)

        const user = await prisma.user.update({
          where: {
            id,
          },
          data: {
            firstname: userInfo?.firstname,
            lastname: userInfo?.lastname,
            mobile: userInfo?.mobile,
            email: userInfo?.email,
            role: userInfo?.role,
          },
        })

        return reply.send({ message: 'User updated successfully', user })
      } catch (error) {
        return reply.send({ message: 'User not found', success: false })
      }
    },
  )
}
