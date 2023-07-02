// import { PrismaClient } from '@prisma/client'
import fastify from 'fastify'
import { authRoutes } from './routes/auth'
// import { prisma } from './lib/prisma'

const server = fastify()
// const prisma = new PrismaClient()

// HTTP Method: GET, POST, PUT, PATCH, DELETE

// server.get('/users', async (request, reply) => {
//   const users = await prisma.user.findMany()

//   reply.send({ users })
// })

server.register(authRoutes)

// API RESTful

const PORT = 3333

server.listen({ port: PORT }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})

export default server
