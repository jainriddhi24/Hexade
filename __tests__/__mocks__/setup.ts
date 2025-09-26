import { jest } from '@jest/globals'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
      replace: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: unknown, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers || {}),
        },
      })
    }),
    redirect: jest.fn(),
  },
}))

jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn((password: string) => Promise.resolve('hashed_password')),
  verifyPassword: jest.fn((plaintext: string, hash: string) => Promise.resolve(true)),
  generateJWT: jest.fn((payload: object) => 'mock_token'),
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  }
}))