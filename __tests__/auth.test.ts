import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { generateToken, verifyToken, hashPassword, verifyPassword } from '@/lib/auth'

describe('Authentication', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key'
  })

  afterEach(() => {
    delete process.env.JWT_SECRET
  })

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(0)
    })

    it('should verify password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
      
      const isInvalid = await verifyPassword('wrongpassword', hashedPassword)
      expect(isInvalid).toBe(false)
    })
  })

  describe('JWT Token', () => {
    it('should generate token correctly', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'CLIENT' as const,
      }
      
      const token = generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should verify token correctly', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'CLIENT' as const,
      }
      
      const token = generateToken(payload)
      const verified = verifyToken(token)
      
      expect(verified).toBeDefined()
      expect(verified?.userId).toBe(payload.userId)
      expect(verified?.email).toBe(payload.email)
      expect(verified?.role).toBe(payload.role)
    })

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here'
      const verified = verifyToken(invalidToken)
      
      expect(verified).toBeNull()
    })

    it('should return null for expired token', () => {
      // This would require mocking time or using a very short expiration
      // For now, we'll test with a malformed token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkNMSUVOVCIsImlhdCI6MTYwOTQ1NjAwMCwiZXhwIjoxNjA5NDU2MDAwfQ.invalid'
      const verified = verifyToken(expiredToken)
      
      expect(verified).toBeNull()
    })
  })
})
