import fastify from 'fastify'
import { authRoutes } from './routes/auth'

const server = fastify()

server.register(authRoutes)

// API RESTful

const PORT = 3333

server.listen({ port: PORT }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})

export default server
