import fastify from 'fastify'

const server = fastify()

// HTTP Method: GET, POST, PUT, PATCH, DELETE

server.post('/hello', (request, reply) => {
  reply.send({ hello: 'World' })
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
