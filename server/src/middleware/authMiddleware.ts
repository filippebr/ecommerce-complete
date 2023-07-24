import { FastifyReply, FastifyRequest } from 'fastify'
import jwt, { Secret } from 'jsonwebtoken'

export default async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  let token

  if (request?.headers?.authorization?.startsWith('Bearer')) {
    token = request.headers.authorization.split(' ')[1]
    try {
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET as Secret)
      }
    } catch (error) {
      reply.send({
        message: 'Not authorized token expired. Please login again',
      })
    }
  } else {
    reply.send({ message: 'There is no token attached to header' })
  }
}
