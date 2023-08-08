import fastify from 'fastify'
import { errorHandler } from './middleware/errorHandler'
import { userRoutes } from './routes/user'

const server = fastify()

server.setErrorHandler(errorHandler)

server.register(userRoutes)

const PORT = 3333

server.listen({ port: PORT }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})

export default server
