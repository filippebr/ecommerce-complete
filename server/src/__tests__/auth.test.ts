import request from 'supertest'
import { beforeAll, describe, expect, test } from 'vitest'
import { prisma } from '../lib/prisma'
import app from '../server'

describe('Authentication tests', () => {
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

    const response = await request(app.server).post('/users/register').send({
      firstname: 'John',
      lastname: 'Doe',
      email: 'doe@email.com',
      mobile: '999999990',
      password: '12345678',
    })

    expect(response.status).toBe(200)
    expect(response.body.createdUser).toHaveProperty('id')
    expect(response.body.createdUser).toHaveProperty('firstname')
    expect(response.body.createdUser).toHaveProperty('lastname')
    expect(response.body.createdUser).toHaveProperty('email')
    expect(response.body.createdUser).toHaveProperty('mobile')
    expect(response.body.createdUser).toHaveProperty('createdAt')
    expect(response.body.createdUser).toHaveProperty('updatedAt')
  })

  test('should not create a new user with an existing email', async () => {
    const response = await request(app.server).post('/users/register').send({
      firstname: 'Jonh',
      lastname: 'Doe',
      email: 'doe@email.com',
      mobile: '999999992',
      password: '12345678',
    })

    expect(response.status).toBe(409)
    expect(response.body.data).toBe(undefined)
    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toBe('User already exists')
  })

  test('should login an existing user', async () => {
    const response = await request(app.server).post('/users/login').send({
      email: 'doe@email.com',
      password: '12345678',
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id')
    expect(response.body).toHaveProperty('firstname')
    expect(response.body).toHaveProperty('lastname')
    expect(response.body).toHaveProperty('email')
    expect(response.body).toHaveProperty('mobile')
    expect(response.body).toHaveProperty('createdAt')
    expect(response.body).toHaveProperty('updatedAt')
    expect(response.body).toHaveProperty('token')
  })

  test('should not login a non-existing user', async () => {
    const response = await request(app.server).post('/users/login').send({
      email: 'jane.doe@email.com',
      password: '12345678',
    })

    expect(response.status).toBe(409)
    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toBe('Email not found')
  })

  test('should not login a user with invalid data', async () => {
    const response = await request(app.server).post('/users/login').send({
      email: 'not a valid email',
      password: '',
    })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.success).toBe(false)
    expect(response.body.error.fieldErrors).toEqual({
      password: ['String must contain at least 6 character(s)'],
      email: ['Invalid email address'],
    })
  })

  test('should not login a user with invalid credentials', async () => {
    const response = await request(app.server).post('/users/login').send({
      email: 'doe@email.com',
      password: 'wrong password',
    })

    expect(response.status).toBe(409)
    expect(response.body).toHaveProperty('message')
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Invalid password')
  })

  test('should return a user', async () => {
    await app.ready()

    const user = await prisma.user.findUnique({
      where: {
        email: 'doe@email.com',
      },
    })

    const id = user?.id

    const response = await request(app.server).get(`/user/${id}`)

    expect(response.statusCode).toEqual(200)
    expect(response.body.user.id).toEqual(user?.id)
    expect(response.body.user.firstname).toEqual(user?.firstname)
    expect(response.body.user.lastname).toEqual(user?.lastname)
    expect(response.body.user.email).toEqual(user?.email)
    expect(response.body.user.mobile).toEqual(user?.mobile)
    expect(response.body.user.password).toEqual(user?.password)
  })
})
