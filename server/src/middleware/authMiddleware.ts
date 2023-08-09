import { FastifyReply, FastifyRequest } from 'fastify'
import jwt, { Secret } from 'jsonwebtoken'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authorizationHeader = request.headers.authorization

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer')) {
    reply.send({ message: 'No valid token attached to the header' })
    return
  }

  const token = authorizationHeader.split(' ')[1]

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as Secret)
    request.body = decodedToken
  } catch (error) {
    reply.send({
      message: 'Not authorized: token expired or invalid. Please log in again',
    })
  }
}

// export async function isAdmin(request: any, reply: FastifyReply) {
//   const role = request.body.id.role
//   if (role !== 'admin') {
//     return reply.send({
//       message: `The role '${role}' is not authorized to this action`,
//     })
//   }
// }
