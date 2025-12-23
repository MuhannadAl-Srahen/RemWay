import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { Label } from '../label'

describe('Label Component', () => {
  it('should render label text', () => {
    render(<Label>Username</Label>)
    
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('should associate with input using htmlFor', () => {
    render(
      <div>
        <Label htmlFor="email-input">Email</Label>
        <input id="email-input" type="email" />
      </div>
    )
    
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('should apply custom className', () => {
    render(<Label className="custom-label">Custom</Label>)
    
    const label = screen.getByText('Custom')
    expect(label).toHaveClass('custom-label')
  })

  it('should handle disabled state styling', () => {
    render(
      <Label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Disabled Label
      </Label>
    )
    
    const label = screen.getByText('Disabled Label')
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null }
    render(<Label ref={ref}>Ref Label</Label>)
    
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })
})
