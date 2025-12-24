import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitChallengeSolution } from '../api'

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: {
            user: {
              id: 'test-user-id',
              user_metadata: {
                user_name: 'testuser',
              },
            },
          },
          error: null,
        })
      ),
    },
    from: vi.fn(() => {
      const eqMock = vi.fn(() => ({
        eq: eqMock,
        neq: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      }))
      return {
        select: vi.fn(() => ({
          eq: eqMock,
          not: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: {
                  id: 'test-submission-id',
                  challenge_id: 'challenge-1',
                  github_url: 'https://github.com/testuser/test-repo',
                  live_site_url: 'https://test-site.vercel.app',
                },
                error: null,
              })
            ),
          })),
        })),
      }
    }),
  },
}))

describe('Challenge Submission Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully submit a valid solution', async () => {
    const result = await submitChallengeSolution('challenge-1', {
      title: 'My Solution',
      githubUrl: 'https://github.com/testuser/test-repo',
      liveUrl: 'https://test-site.vercel.app',
      screenshot: null,
      description: '',
    })

    expect(result).toBeDefined()
    expect(result.submissionId).toBe('test-submission-id')
  })

  it('should reject submission with invalid GitHub URL', async () => {
    await expect(
      submitChallengeSolution('challenge-1', {
        title: 'My Solution',
        githubUrl: 'https://gitlab.com/testuser/test-repo',
        liveUrl: 'https://test-site.vercel.app',
        screenshot: null,
        description: '',
      })
    ).rejects.toThrow()
  })

  it('should reject submission from wrong GitHub user', async () => {
    await expect(
      submitChallengeSolution('challenge-1', {
        title: 'My Solution',
        githubUrl: 'https://github.com/otheruser/test-repo',
        liveUrl: 'https://test-site.vercel.app',
        screenshot: null,
        description: '',
      })
    ).rejects.toThrow('GITHUB_OWNERSHIP_ERROR')
  })
})
