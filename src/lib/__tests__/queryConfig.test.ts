import { describe, it, expect } from 'vitest'
import { queryKeys, STALE_TIME, CACHE_VALIDITY, RETRY_CONFIG } from '../queryConfig'

describe('Query Configuration', () => {
  describe('Query Keys', () => {
    it('should generate auth keys', () => {
      expect(queryKeys.auth).toEqual(['auth'])
      expect(queryKeys.currentUser).toEqual(['auth', 'currentUser'])
    })

    it('should generate challenge keys', () => {
      expect(queryKeys.challenges).toEqual(['challenges'])
      expect(queryKeys.challengeDetail('123')).toEqual(['challenges', 'detail', '123'])
      expect(queryKeys.challengeList()).toEqual(['challenges', 'list', undefined])
      expect(queryKeys.challengeList({ difficulty: 'beginner' })).toEqual([
        'challenges',
        'list',
        { difficulty: 'beginner' },
      ])
    })

    it('should generate submission keys', () => {
      expect(queryKeys.submissions).toEqual(['submissions'])
      expect(queryKeys.submissionDetail('456')).toEqual(['submissions', 'detail', '456'])
    })

    it('should generate feedback keys', () => {
      expect(queryKeys.feedback).toEqual(['feedback'])
      expect(queryKeys.submissionFeedback('789')).toEqual([
        'feedback',
        'submission',
        '789',
      ])
    })

    it('should generate profile keys', () => {
      expect(queryKeys.profile).toEqual(['profile'])
      expect(queryKeys.profileDetail('user123')).toEqual(['profile', 'detail', 'user123'])
      expect(queryKeys.savedChallenges('user123')).toEqual([
        'profile',
        'savedChallenges',
        'user123',
      ])
    })

    it('should generate roadmap keys', () => {
      expect(queryKeys.roadmap).toEqual(['roadmap'])
      expect(queryKeys.learningPaths).toEqual(['roadmap', 'paths'])
      expect(queryKeys.pathDetail('path1')).toEqual(['roadmap', 'path', 'path1'])
    })
  })

  describe('Stale Time Constants', () => {
    it('should have correct stale time values', () => {
      expect(STALE_TIME.SHORT).toBe(30 * 1000) // 30 seconds
      expect(STALE_TIME.MEDIUM).toBe(5 * 60 * 1000) // 5 minutes
      expect(STALE_TIME.LONG).toBe(30 * 60 * 1000) // 30 minutes
      expect(STALE_TIME.INFINITE).toBe(Infinity)
    })
  })

  describe('Cache Validity Constants', () => {
    it('should have correct cache validity values', () => {
      expect(CACHE_VALIDITY.SHORT).toBe(5 * 60 * 1000) // 5 minutes
      expect(CACHE_VALIDITY.MEDIUM).toBe(30 * 60 * 1000) // 30 minutes
      expect(CACHE_VALIDITY.LONG).toBe(24 * 60 * 60 * 1000) // 24 hours
    })
  })

  describe('Retry Config', () => {
    it('should have correct retry configurations', () => {
      expect(RETRY_CONFIG.DEFAULT).toBe(3)
      expect(RETRY_CONFIG.NONE).toBe(false)
      expect(RETRY_CONFIG.INFINITE).toBe(true)
    })
  })
})
