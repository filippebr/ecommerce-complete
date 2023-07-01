import supertest from 'supertest'
import { describe, expect, test } from 'vitest'
import app from '../server'

describe('GET /users', () => {
  // afterAll(() => app.close());

  test('should return all users', async () => {
    await app.ready()

    const response = await supertest(app.server).get('/users')

    expect(response.statusCode).toEqual(200)
    expect(response.text.length).toBeGreaterThan(0)
  })
})
