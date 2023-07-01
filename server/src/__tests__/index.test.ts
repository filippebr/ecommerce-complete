import supertest from 'supertest'
import { describe, expect, test } from 'vitest'
import app from '../server'

describe('Testing server', () => {
  // afterAll(() => app.close());

  test('GET `/` route', async () => {
    await app.ready()

    const response = await supertest(app.server).post('/hello').expect(200)

    expect(response.body).toEqual({ hello: 'World' })
  })
})
