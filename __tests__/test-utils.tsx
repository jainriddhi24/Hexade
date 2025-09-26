import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'
import type { ReactElement, ReactNode } from 'react'
import type { RenderOptions } from '@testing-library/react'

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
}))

interface WrapperProps {
  children: ReactNode
}

function wrapper({ children }: WrapperProps) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

function render(
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) {
  return rtlRender(ui, {
    wrapper,
    ...options,
  })
}

export * from '@testing-library/react'
export { render }