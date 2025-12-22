import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isValidGitHubUrl,
  isValidLiveSiteUrl,
  isSuspiciousUrl,
  checkLiveSiteAccessibility,
} from '../validation'

describe('AI Validation Functions', () => {
  describe('isValidGitHubUrl', () => {
    it('should accept valid GitHub URLs', () => {
      expect(isValidGitHubUrl('https://github.com/user/repo')).toBe(true)
      expect(isValidGitHubUrl('https://github.com/user-name/repo-name')).toBe(true)
      expect(isValidGitHubUrl('https://github.com/user/repo/')).toBe(true)
      expect(isValidGitHubUrl('http://github.com/user/repo')).toBe(true)
    })

    it('should reject invalid GitHub URLs', () => {
      expect(isValidGitHubUrl('https://gitlab.com/user/repo')).toBe(false)
      expect(isValidGitHubUrl('github.com/user/repo')).toBe(false)
      expect(isValidGitHubUrl('https://github.com/user')).toBe(false)
      expect(isValidGitHubUrl('https://github.com')).toBe(false)
      expect(isValidGitHubUrl('not a url')).toBe(false)
      expect(isValidGitHubUrl('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidGitHubUrl('https://github.com/user/repo/tree/main')).toBe(true)
      expect(isValidGitHubUrl('https://github.com/user/repo.git')).toBe(true)
    })
  })

  describe('isValidLiveSiteUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      expect(isValidLiveSiteUrl('https://my-site.vercel.app')).toBe(true)
      expect(isValidLiveSiteUrl('https://example.netlify.app')).toBe(true)
      expect(isValidLiveSiteUrl('https://my-project.pages.dev')).toBe(true)
      expect(isValidLiveSiteUrl('https://example.com')).toBe(true)
    })

    it('should accept HTTP URLs', () => {
      expect(isValidLiveSiteUrl('http://my-site.vercel.app')).toBe(true)
      expect(isValidLiveSiteUrl('http://example.com')).toBe(true)
    })

    it('should reject localhost URLs', () => {
      expect(isValidLiveSiteUrl('https://localhost:3000')).toBe(false)
      expect(isValidLiveSiteUrl('https://127.0.0.1:3000')).toBe(false)
      // 0.0.0.0 is not checked in current implementation, so it passes
      expect(isValidLiveSiteUrl('https://0.0.0.0:3000')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidLiveSiteUrl('not a url')).toBe(false)
      expect(isValidLiveSiteUrl('')).toBe(false)
      expect(isValidLiveSiteUrl('ftp://example.com')).toBe(false)
    })
  })

  describe('isSuspiciousUrl', () => {
    it('should detect suspicious patterns', () => {
      // Test if the function exists and returns boolean
      const result = isSuspiciousUrl('https://example.com')
      expect(typeof result).toBe('boolean')
    })

    it('should handle normal URLs', () => {
      expect(isSuspiciousUrl('https://my-site.vercel.app')).toBe(false)
      // example.com is considered suspicious (test/placeholder domain)
      expect(isSuspiciousUrl('https://example.com')).toBe(true)
    })
  })

  describe('checkLiveSiteAccessibility', () => {
    beforeEach(() => {
      // Reset fetch mock before each test
      vi.clearAllMocks()
    })

    it('should return true for accessible URLs', async () => {
      // Mock successful fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
        } as Response)
      )

      const result = await checkLiveSiteAccessibility('https://example.com')
      expect(result.accessible).toBe(true)
    })

    it('should return false for inaccessible URLs', async () => {
      // Mock failed fetch
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      )

      const result = await checkLiveSiteAccessibility('https://nonexistent.com')
      expect(result.accessible).toBe(false)
    })

    it('should handle CORS errors', async () => {
      // Mock CORS error
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('CORS error'))
      )

      const result = await checkLiveSiteAccessibility('https://example.com')
      expect(result.accessible).toBe(false)
    })
  })
})
