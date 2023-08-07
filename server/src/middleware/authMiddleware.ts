import { FastifyReply, FastifyRequest } from 'fastify'
import jwt, { Secret } from 'jsonwebtoken'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  let token

  if (request?.headers?.authorization?.startsWith('Bearer')) {
    token = request.headers.authorization.split(' ')[1]
    try {
      if (token) {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as Secret)

        request.body = decodedToken
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

export async function isAdmin(request: any, reply: FastifyReply) {
  const role = request.body.id.role
  if (role !== 'admin') {
    return reply.send({
      message: `The role '${role}' is not authorized to this action`,
    })
  }
}
