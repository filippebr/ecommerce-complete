import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify'
import { z } from 'zod'

export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          message: 'Invalid request body errorHandler',
          success: false,
        })
      } else if (error instanceof Error) {
        return reply.status(400).send({
          message: error.message,
        })
      } else {
        reply.code(500).send({
          message: 'Internal Server Error in errorHandler',
          success: false,
        })
      }
    },
  )
}
