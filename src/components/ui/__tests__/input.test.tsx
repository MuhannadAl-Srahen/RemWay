import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { Input } from '../input'

describe('Input Component', () => {
  it('should render with default styling', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('w-full', 'rounded-md', 'border')
  })

  it('should accept and display user input', () => {
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    input.focus()
    input.setAttribute('value', 'Test value')
    
    expect(input).toHaveAttribute('value', 'Test value')
  })

  it('should handle disabled state', () => {
    render(<Input disabled placeholder="Disabled" />)
    
    const input = screen.getByPlaceholderText('Disabled')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('should apply custom className', () => {
    render(<Input className="custom-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('should handle type attribute', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" />)
    const passwordInput = document.querySelector('input[type="password"]')
    expect(passwordInput).toBeInTheDocument()
  })

  it('should forward ref correctly', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
