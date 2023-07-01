import { PrismaClient } from '@prisma/client'
import fastify from 'fastify'

const server = fastify()
const prisma = new PrismaClient()

// HTTP Method: GET, POST, PUT, PATCH, DELETE

server.get('/users', async (request, reply) => {
  const users = await prisma.user.findMany()

  reply.send({ users })
})

// API RESTful

server
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })

export default server
