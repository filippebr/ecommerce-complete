import supertest from 'supertest'
import { beforeEach, describe, expect, test } from 'vitest'
import { prisma } from '../lib/prisma'
import app from '../server'

describe('GET /users', () => {
  // afterAll(() => app.close());

  beforeEach(async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: 'carlos@email.com',
      },
    })

    if (user) {
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      })
    }
  })

  test('should return all users', async () => {
    await app.ready()

    const response = await supertest(app.server).get('/users')

    expect(response.statusCode).toEqual(200)
    expect(response.text.length).toBeGreaterThan(0)
  })

  test('should create a user', async () => {
    await app.ready()

    const response = await supertest(app.server).post('/users').send({
      firstname: 'Carlos',
      lastname: 'Silva',
      email: 'carlos@email.com',
      mobile: '999999992',
      password: '12345',
    })

    expect(response.status).toBe(200)
  })
})
