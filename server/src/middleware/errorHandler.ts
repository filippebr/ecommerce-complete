import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof z.ZodError) {
    return reply.status(400).send({
      success: false,
      error: error.flatten(),
    })
  } else if (error instanceof Error) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  // If the error is not of a known type, you can handle it accordingly
  // For example, you can send a generic error response
  reply.status(500).send({
    success: false,
    error: 'Internal Server Error',
  })
}
