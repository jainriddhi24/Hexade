import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import crossFetch from 'cross-fetch'
import { jest } from '@jest/globals'

Object.defineProperty(global, 'TextEncoder', { value: TextEncoder })
Object.defineProperty(global, 'TextDecoder', { value: TextDecoder })

global.fetch = crossFetch
global.Headers = crossFetch.Headers
global.Request = crossFetch.Request
global.Response = crossFetch.Response

const { NextResponse } = require('next/server')
NextResponse.json = jest.fn().mockImplementation((data, init) => {
  const response = new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })
  return response
})
global.NextResponse = NextResponse

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
      replace: jest.fn(),
      pathname: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))