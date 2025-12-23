import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { Badge } from '../badge'

describe('Badge Component', () => {
  it('should render with default variant', () => {
    render(<Badge>Default Badge</Badge>)
    
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('should render secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    
    const badge = screen.getByText('Secondary')
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')
  })

  it('should render destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>)
    
    const badge = screen.getByText('Destructive')
    expect(badge).toHaveClass('bg-destructive')
  })

  it('should render outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>)
    
    const badge = screen.getByText('Outline')
    expect(badge).toHaveClass('text-foreground')
  })

  it('should apply custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-badge')
  })

  it('should render with different content types', () => {
    const { rerender } = render(<Badge>Text Badge</Badge>)
    expect(screen.getByText('Text Badge')).toBeInTheDocument()
    
    rerender(<Badge>{123}</Badge>)
    expect(screen.getByText('123')).toBeInTheDocument()
    
    rerender(
      <Badge>
        <span>Complex Content</span>
      </Badge>
    )
    expect(screen.getByText('Complex Content')).toBeInTheDocument()
  })
})
