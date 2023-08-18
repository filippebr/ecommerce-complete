import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import jwt, { Secret } from 'jsonwebtoken'
import { z } from 'zod'
import generateJsonWebToken from '../config/jwtToken'
import generateRefreshToken from '../config/refreshToken'
import { prisma } from '../lib/prisma'
import userSchema from '../schemas/userSchema'
import BcryptService from '../services/bcryptService'

type UserParams = {
  id: string
  firstname: string
  lastname: string
  email: string
  mobile: string
  password: string
  role: string
  isBlocked: boolean
  address: string | null
  createdAt: Date
  updatedAt: Date
  refreshToken: string | null
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

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
    })

    const refreshToken = generateRefreshToken(user as UserParams)

    reply.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    })

    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        refreshToken,
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
  } catch (error) {
    reply.code(409).send({ message: 'Non-existing user', success: false })
  }
}

export const logoutUser: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const cookie = request.cookies

  try {
    if (!cookie?.refreshToken)
      return reply.send({ message: 'No Refresh Token in cookies' })

    const refreshToken = cookie.refreshToken

    const user = await prisma.user.findFirst({
      where: {
        refreshToken,
      },
    })

    if (!user) {
      reply.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
      })
      return reply.send({ message: 'This user do not exist' })
    }

    const id = user.id

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: '',
      },
    })

    reply.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    })

    return reply.send({ message: 'Logout with success' })
  } catch (error) {
    return reply.send({ message: error })
  }
}

export const refreshToken = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const cookie = request.cookies

    if (!cookie?.refreshToken)
      return reply.send({ message: 'No refresh Token in cookie' })

    const refreshToken = cookie.refreshToken

    const user = await prisma.user.findFirst({
      where: {
        refreshToken,
      },
    })

    if (!user)
      return reply.send({
        message: 'No refresh token present in db or not matched',
      })

    jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as Secret,
      (err: any, decoded: any): void => {
        if (err || user.id !== decoded.id) {
          reply.send({ message: 'Something wrong with refreshToken' })
        }
        const accessToken = generateJsonWebToken(user)
        reply.send({ accessToken })
      },
    )

    return reply.send({ user })
  } catch (error) {
    return reply.send({ message: error })
  }
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

export const blockUser: RouteHandlerMethod = async (request, reply) => {
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

export const unblockUser: RouteHandlerMethod = async (request, reply) => {
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
