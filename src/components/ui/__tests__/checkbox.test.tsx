import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { Checkbox } from '../checkbox'

describe('Checkbox Component', () => {
  it('should render checkbox', () => {
    render(<Checkbox aria-label="Accept terms" />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('should handle checked state', () => {
    const { rerender } = render(<Checkbox checked={false} />)
    
    let checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    
    rerender(<Checkbox checked={true} />)
    checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('should handle disabled state', () => {
    render(<Checkbox disabled />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('should call onCheckedChange when clicked', async () => {
    const onCheckedChange = vi.fn()
    const { user } = render(<Checkbox onCheckedChange={onCheckedChange} />)
    
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
  })

  it('should not call onCheckedChange when disabled', async () => {
    const onCheckedChange = vi.fn()
    const { user } = render(<Checkbox disabled onCheckedChange={onCheckedChange} />)
    
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    render(<Checkbox className="custom-checkbox" />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-checkbox')
  })

  it('should handle indeterminate state', () => {
    render(<Checkbox checked="indeterminate" />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
  })
})
