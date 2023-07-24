import jwt, { Secret } from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { prisma } from '../lib/prisma'
import app from '../server'

describe('Authentication tests', () => {
  afterAll(() => app.close())

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

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        email: 'doe@email.com',
      },
    })
  })

  test('should return all users', async () => {
    await app.ready()

    const response = await request(app.server).get('/users')

    expect(response.statusCode).toEqual(200)
    expect(response.text.length).toBeGreaterThan(0)
  })

  test('should create a user', async () => {
    await app.ready()

    const response = await request(app.server).post('/user/register').send({
      firstname: 'John',
      lastname: 'Doe',
      email: 'doe@email.com',
      mobile: '099999999',
      password: '12345678',
      role: 'user',
      address: 'Rua John Doe, 123',
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
    const response = await request(app.server).post('/user/register').send({
      firstname: 'John',
      lastname: 'Doe',
      email: 'doe@email.com',
      mobile: '999999992',
      password: '12345678',
      role: 'user',
      address: 'Rua John Doe, 123',
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

    const token = jwt.sign(
      { userId: user?.id },
      process.env.JWT_SECRET as Secret,
      {
        expiresIn: '1h', // Set the token expiry time according to your application's requirements
      },
    )

    // Include the token in the request headers
    const response = await request(app.server)
      .get(`/user/${user?.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(200)
    expect(response.body.user.id).toEqual(user?.id)
    expect(response.body.user.firstname).toEqual(user?.firstname)
    expect(response.body.user.lastname).toEqual(user?.lastname)
    expect(response.body.user.email).toEqual(user?.email)
    expect(response.body.user.mobile).toEqual(user?.mobile)
    expect(response.body.user.password).toEqual(user?.password)
  })

  test('should not return a user', async () => {
    await app.ready()

    const user = await prisma.user.findUnique({
      where: {
        email: 'doe@email.com',
      },
    })

    const token = jwt.sign(
      { userId: user?.id },
      process.env.JWT_SECRET as Secret,
      {
        expiresIn: '1h', // Set the token expiry time according to your application's requirements
      },
    )

    const response = await request(app.server)
      .get(`/user/:00000`)
      .set('Authorization', `Bearer ${token}`)

    console.log('body: ', response.body)

    expect(response.body.user).toEqual(null)
  })

  test('should create and delete a user', async () => {
    await app.ready()

    // Create a new user
    const createUserResponse = await request(app.server)
      .post('/user/register')
      .send({
        firstname: 'Jose',
        lastname: 'Doe',
        email: 'jose.doe@email.com',
        mobile: '9999999999',
        password: '12345678',
        role: 'user',
        address: 'run jose doe, 111',
      })

    expect(createUserResponse.status).toBe(200)
    expect(createUserResponse.body.createdUser).toHaveProperty('id')

    // Extract the created user's ID
    const { id } = createUserResponse.body.createdUser

    // Delete the user
    const deleteUserResponse = await request(app.server).delete(`/user/${id}`)

    expect(deleteUserResponse.status).toBe(200)
    expect(deleteUserResponse.body).toHaveProperty(
      'message',
      'User deleted successfully',
    )
  })

  test('should update a already created user', async () => {
    await app.ready()

    const user = await prisma.user.findUnique({
      where: {
        email: 'doe@email.com',
      },
    })

    const id = user?.id

    const updateUserResponse = await request(app.server)
      .put(`/user/${id}`)
      .send({
        firstname: 'Jon',
        lastname: 'Do',
        email: 'doe@email.com',
        mobile: '9999999997',
        password: '12345678',
        role: 'user',
        address: 'rua jon do, 111',
      })

    expect(updateUserResponse.status).toBe(200)
    expect(updateUserResponse.body.message).toEqual('User updated successfully')
    expect(updateUserResponse.body.user.firstname).toEqual('Jon')
    expect(updateUserResponse.body.user.lastname).toEqual('Do')
    expect(updateUserResponse.body.user.mobile).toEqual('9999999997')
  })
})
