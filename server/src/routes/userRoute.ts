import { FastifyInstance } from 'fastify'

import {
  blockUser,
  deleteUser,
  getUser,
  getUsers,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  unblockUser,
  updateUser,
} from '../controllers/userCtrl'
import { authMiddleware, isAdmin } from '../middleware/authMiddleware'

export async function userRoutes(app: FastifyInstance) {
  // app.get('/', (request: FastifyRequest, reply: FastifyReply) => {
  //   const aCookieValue = request.cookies.cookieName
  //   console.log('aCookieValue: ', aCookieValue)
  //   // `reply.unsignCookie()` is also available
  //   const cookieSignedValue = request.cookies.cookieSigned as string
  //   const bCookie = request.unsignCookie(cookieSignedValue)
  //   console.log('bCookie: ', bCookie)
  //   reply
  //     .setCookie('foo', 'foo', {
  //       domain: 'example.com',
  //       path: '/',
  //     })
  //     .cookie('baz', 'baz') // alias for setCookie
  //     .setCookie('bar', 'bar', {
  //       path: '/',
  //       signed: true,
  //     })
  //     .send({ hello: 'world' })
  // })

  app.get('/:id', getUser)
  app.get('/all', getUsers)
  app.get('/refresh', { preHandler: [authMiddleware, isAdmin] }, refreshToken)
  app.post('/register', registerUser)
  app.post('/login', loginUser)
  app.get('/logout', logoutUser)
  app.delete('/:id', deleteUser)
  app.put('/:id', updateUser)
  app.put(
    '/block-user/:id',
    { preHandler: [authMiddleware, isAdmin] },
    blockUser,
  )
  app.put(
    '/unblock-user/:id',
    { preHandler: [authMiddleware, isAdmin] },
    unblockUser,
  )
}
