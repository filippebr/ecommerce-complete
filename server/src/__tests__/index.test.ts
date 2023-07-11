import request from 'supertest'
import { beforeAll, describe, expect, test } from 'vitest'
import { prisma } from '../lib/prisma'
import app from '../server'

describe('GET /users', () => {
  // afterAll(() => app.close());

  beforeAll(async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: 'doe@email.com',
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

    const response = await request(app.server).get('/users')

    expect(response.statusCode).toEqual(200)
    expect(response.text.length).toBeGreaterThan(0)
  })

  test('should create a user', async () => {
    await app.ready()

    const response = await request(app.server).post('/users').send({
      firstname: 'John',
      lastname: 'Doe',
      email: 'doe@email.com',
      mobile: '999999992',
      password: '12345678',
    })

    expect(response.status).toBe(200)
  })

  test('should not create a new user with an existing email', async () => {
    const response = await request(app.server).post('/users').send({
      firstname: 'Jonh',
      lastname: 'Doe',
      email: 'doe@email.com',
      mobile: '999999992',
      password: '12345678',
    })

    // console.log('error: ', response.request._data)

    expect(response.status).toBe(409)
    expect(response.body.data).toBe(undefined)
    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toBe('User already exists')
  })
})
