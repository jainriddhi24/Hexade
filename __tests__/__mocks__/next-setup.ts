import { Headers } from 'node-fetch'

jest.mock('next/server', () => {
  return {
    NextRequest: class {
      nextUrl: URL
      cookies: { [key: string]: any }
      method: string
      body: any
      headers: Headers
      ip = ''
      geo = {}

      constructor(input: string | URL, init?: RequestInit) {
        this.nextUrl = new URL(input.toString())
        this.cookies = {
          get: jest.fn(),
          set: jest.fn(),
          getAll: jest.fn(),
          has: jest.fn(),
          delete: jest.fn(),
        }
        this.method = init?.method || 'GET'
        this.body = init?.body
        this.headers = new Headers(init?.headers)
      }

      json() {
        return Promise.resolve(JSON.parse(this.body))
      }
    }
  }
})