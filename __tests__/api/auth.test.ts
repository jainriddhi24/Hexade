import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { POST as loginHandler } from '@/app/api/auth/login/route'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    lawyerProfile: {
      create: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashedpassword')),
  compare: jest.fn(() => Promise.resolve(true)),
}))

describe('/api/auth/register', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new client successfully', async () => {
    const { prisma } = require('@/lib/db')
    
    prisma.user.findUnique.mockResolvedValue(null) // User doesn't exist
    prisma.user.create.mockResolvedValue({
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'CLIENT',
    })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'CLIENT',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await registerHandler(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('User registered successfully')
    expect(data.user.email).toBe('test@example.com')
    expect(data.user.role).toBe('CLIENT')
  })

  it('should return error for existing user', async () => {
    const { prisma } = require('@/lib/db')
    
    prisma.user.findUnique.mockResolvedValue({
      id: 'existing-user',
      email: 'test@example.com',
    })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'CLIENT',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await registerHandler(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('User with this email already exists')
  })

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: '123', // Too short
        name: 'T', // Too short
        role: 'INVALID_ROLE',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await registerHandler(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation error')
    expect(data.details).toBeDefined()
  })
})

describe('/api/auth/login', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should login user successfully', async () => {
    const { prisma } = require('@/lib/db')
    
    prisma.user.findUnique.mockResolvedValue({
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'CLIENT',
      passwordHash: 'hashedpassword',
      emailVerified: true,
      lawyerProfile: null,
    })

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await loginHandler(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Login successful')
    expect(data.user.email).toBe('test@example.com')
  })

  it('should return error for invalid credentials', async () => {
    const { prisma } = require('@/lib/db')
    
    prisma.user.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await loginHandler(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid email or password')
  })

  it('should return error for unverified email', async () => {
    const { prisma } = require('@/lib/db')
    
    prisma.user.findUnique.mockResolvedValue({
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'CLIENT',
      passwordHash: 'hashedpassword',
      emailVerified: false,
      lawyerProfile: null,
    })

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await loginHandler(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Please verify your email address before logging in')
    expect(data.requiresVerification).toBe(true)
  })
})
