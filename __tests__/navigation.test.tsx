import { screen } from '@testing-library/react'
import { Navigation } from '@/components/navigation'
import { render } from './test-utils'
import '@testing-library/jest-dom'

describe('Navigation', () => {
  it('renders navigation container', () => {
    render(<Navigation />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders logo and home link', () => {
    render(<Navigation />)
    const logo = screen.getByAltText('Hexade Logo')
    expect(logo).toBeInTheDocument()
    expect(logo.getAttribute('src')).toBe('/logo.png')
    expect(screen.getByRole('link', { name: /hexade/i })).toBeInTheDocument()
  })

  it('renders main navigation links', () => {
    render(<Navigation />)
    expect(screen.getByRole('link', { name: /features/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /pricing/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /how it works/i })).toBeInTheDocument()
  })
})