import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const isDisabled = false
      const result = cn('base', isActive && 'conditional', isDisabled && 'excluded')
      expect(result).toContain('base')
      expect(result).toContain('conditional')
      expect(result).not.toContain('excluded')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4')
      // Should keep the last px class
      expect(result).toContain('px-4')
      expect(result).not.toContain('px-2')
    })

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })
  })
})
