import fastify from 'fastify'
import authMiddleware from './middleware/authMiddleware'
import { errorHandler } from './middleware/errorHandler'
import { authRoutes } from './routes/auth'

const server = fastify()

server.addHook('preHandler', async (request, reply, done) => {
  // Your authMiddleware logic goes here
  await authMiddleware(request, reply)
  done()
})

server.setErrorHandler(errorHandler)

server.register(authRoutes)

const PORT = 3333

server.listen({ port: PORT }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})

export default server
