import type { FastifyCookieOptions } from '@fastify/cookie'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import fastify from 'fastify'
import { errorHandler } from './middleware/errorHandler'
import { userRoutes } from './routes/user'

const server = fastify()

server.setErrorHandler(errorHandler)

server.register(jwt, {
  secret: 'ecommerce',
})

server.register(cookie, {
  secret: 'cookieecommerce',
  hook: 'onRequest',
  parseOptions: {},
} as FastifyCookieOptions)

server.register(userRoutes, { prefix: 'api/user' })

const PORT = 3333

server.listen({ port: PORT }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})

export default server
