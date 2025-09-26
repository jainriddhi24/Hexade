import { describe, it, expect, jest } from '@jest/globals'
import { POST } from '@/app/api/auth/register/route'
import { hashPassword } from '@/lib/auth'
import { NextRequest } from 'next/server'
import '../__mocks__/next-setup'

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const { prisma } = require('@/lib/db')

// Create a test request
function createTestRequest(url: string, method: string, body: any) {
  return new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })
}

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

    const request = createTestRequest('http://localhost:3000/api/auth/register', 'POST', testUser)

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('User registered successfully')
    expect(data.user.email).toBe(testUser.email)
    expect(data.user.role).toBe(testUser.role)
  })
})