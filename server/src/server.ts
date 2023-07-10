import fastify from 'fastify'
import { errorHandler } from './middleware/errorHandler'
import { authRoutes } from './routes/auth'

const server = fastify()

server.setErrorHandler(errorHandler)

server.register(authRoutes)

const PORT = 3333

server.listen({ port: PORT }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})

export default server
