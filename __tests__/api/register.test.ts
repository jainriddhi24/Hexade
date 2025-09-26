import { describe, it, expect, jest } from '@jest/globals'
import { hashPassword } from '@/lib/auth'
import { NextResponse } from 'next/server'

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const { prisma } = require('@/lib/db')

describe('api/auth/register', () => {
  it('should register a new client successfully', async () => {
    const testUser = {
      email: 'test@example.com',
      password: 'Test123!@#',
      name: 'Test User',
      role: 'CLIENT',
    }

    prisma.user.findUnique.mockResolvedValueOnce(null)
    prisma.user.create.mockResolvedValueOnce({
      ...testUser,
      id: '1',
      password: await hashPassword(testUser.password),
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
    })

    const request = new Request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser),
    })

    const response = await fetch(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe(testUser.email)
    expect(data.user.role).toBe(testUser.role)
  })
})