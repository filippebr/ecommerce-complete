import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import { z } from 'zod'
import generateJsonWebToken from '../config/jwtToken'
import { prisma } from '../lib/prisma'
import BcryptService from '../services/bcryptService'
import userSchema from '../services/userSchema'

interface UserParams {
  id: string
}

export const getUser: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as UserParams

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })

    return reply.send({ user })
  } catch (error) {
    return reply.send(error)
  }
}

export const getUsers: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const users = await prisma.user.findMany()
    reply.send({ users })
  } catch (error) {
    reply.send(error)
  }
}

export const registerUser: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userInfo = userSchema.parse(request.body)
    const passwordHashed = BcryptService.hashPassword(userInfo.password)

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
}

export const loginUser: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
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
    return reply.code(409).send({ message: 'Email not found', success: false })

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
}

export const deleteUser: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as UserParams

    const user = await prisma.user.delete({
      where: {
        id,
      },
    })

    return reply.send({ message: 'User deleted successfully', user })
  } catch (error) {
    return reply.send({ message: 'User not found', success: false })
  }
}

export const updateUser: RouteHandlerMethod = async (request, reply) => {
  const { id } = request.params as UserParams

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
        address: userInfo?.address,
      },
    })

    return reply.send({ message: 'User updated successfully', user })
  } catch (error) {
    return reply.send({ message: error, success: false })
  }
}

export const blockUserHandler: RouteHandlerMethod = async (request, reply) => {
  const { id } = request.params as UserParams

  try {
    const block = await prisma.user.update({
      where: {
        id,
      },
      data: {
        isBlocked: true,
      },
    })

    return reply.send({ message: 'User blocked successfully', block })
  } catch (error) {
    return reply.send({ message: 'User not found', success: false })
  }
}

export const unblockUserHandler: RouteHandlerMethod = async (
  request,
  reply,
) => {
  const { id } = request.params as UserParams

  try {
    const unblock = await prisma.user.update({
      where: {
        id,
      },
      data: {
        isBlocked: false,
      },
    })

    return reply.send({ message: 'User unblocked successfully', unblock })
  } catch (error) {
    return reply.send({ message: 'User not found', success: false })
  }
}
