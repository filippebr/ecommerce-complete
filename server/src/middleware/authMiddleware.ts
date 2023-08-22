import { FastifyReply, FastifyRequest } from 'fastify'
import { JwtPayload } from 'jsonwebtoken'
import { validateAccessToken } from '../config/jwtToken'
import { prisma } from '../lib/prisma'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const unauthorizedError = () => {
    reply.statusCode = 401
    reply.send({
      message: 'Not authorized: token expired or invalid. Please log in again',
    })
  }

  try {
    const authorizationHeader = request.headers.authorization

    if (!authorizationHeader) {
      unauthorizedError()
      return
    }

    const accessToken = authorizationHeader?.split(' ')[1]

    if (!accessToken) {
      unauthorizedError()
      return
    }

    const userData = validateAccessToken(accessToken as string)

    if (!userData) {
      unauthorizedError()
      return
    }

    request.user = userData as JwtPayload
  } catch (e) {
    unauthorizedError()
  }
}

export async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
  const { id: authId } = request.user as { id: string }

  console.log('request.user: ', request.user)

  const tokenUser = await prisma.user.findUnique({
    where: {
      id: authId,
    },
  })

  const role = tokenUser?.role

  if (role !== 'admin') {
    return reply.send({
      message: `The role '${role}' is not authorized to this action`,
    })
  }
}
