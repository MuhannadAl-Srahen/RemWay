import { vi } from 'vitest'
import { mockUserProfile, mockChallenge, mockSubmission } from './data'

/**
 * Mock Supabase client for testing
 */
export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn((table: string) => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() =>
          Promise.resolve({
            data: table === 'profiles' ? mockUserProfile : mockChallenge,
            error: null,
          })
        ),
        data: table === 'challenges' ? [mockChallenge] : [],
        error: null,
      })),
      order: vi.fn(() => ({
        data: [mockChallenge],
        error: null,
      })),
      limit: vi.fn(() => ({
        data: [mockChallenge],
        error: null,
      })),
      data: [mockChallenge],
      error: null,
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() =>
          Promise.resolve({
            data: mockSubmission,
            error: null,
          })
        ),
      })),
      data: mockSubmission,
      error: null,
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() =>
        Promise.resolve({
          data: mockUserProfile,
          error: null,
        })
      ),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() =>
        Promise.resolve({
          data: null,
          error: null,
        })
      ),
    })),
  }))

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: {
            user: {
              id: 'test-user-id',
              user_metadata: {
                user_name: 'testuser',
                avatar_url: 'https://github.com/testuser.png',
              },
            },
          },
          error: null,
        })
      ),
      signInWithOAuth: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  }
}

// Mock the supabase client module
vi.mock('@/lib/supabaseClient', () => ({
  supabase: createMockSupabaseClient(),
}))
