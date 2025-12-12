/**
 * Centralized React Query configuration
 * Use these constants across the application for consistent caching behavior
 */

// Stale time: How long data is considered fresh (in milliseconds)
export const STALE_TIME = {
  SHORT: 30 * 1000, // 30 seconds - for frequently changing data
  MEDIUM: 5 * 60 * 1000, // 5 minutes - for moderately static data
  LONG: 30 * 60 * 1000, // 30 minutes - for rarely changing data
  INFINITE: Infinity, // For data that never changes
} as const

// Cache validity (gcTime): How long unused data stays in cache (in milliseconds)
export const CACHE_VALIDITY = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const

// Retry configuration
export const RETRY_CONFIG = {
  DEFAULT: 3, // Number of retries for failed requests
  NONE: false, // Don't retry
  INFINITE: true, // Retry indefinitely
} as const

// Refetch intervals
export const REFETCH_INTERVAL = {
  FAST: 10 * 1000, // 10 seconds - for real-time data
  NORMAL: 60 * 1000, // 1 minute
  SLOW: 5 * 60 * 1000, // 5 minutes
} as const

/**
 * Query key factories for consistent cache key management
 * Use these to generate standardized query keys
 */
export const queryKeys = {
  // Authentication
  auth: ['auth'] as const,
  currentUser: ['auth', 'currentUser'] as const,

  // Challenges
  challenges: ['challenges'] as const,
  challengeList: (filters?: unknown) =>
    ['challenges', 'list', filters] as const,
  challengeDetail: (id: string) => ['challenges', 'detail', id] as const,
  challengeProgress: (userId: string, challengeId: string) =>
    ['challenges', 'progress', userId, challengeId] as const,

  // Submissions
  submissions: ['submissions'] as const,
  submissionList: (userId?: string) => ['submissions', 'list', userId] as const,
  submissionDetail: (id: string) => ['submissions', 'detail', id] as const,

  // Profile
  profile: ['profile'] as const,
  profileDetail: (userId: string) => ['profile', 'detail', userId] as const,
  profileStats: (userId: string) => ['profile', 'stats', userId] as const,
  savedChallenges: (userId: string) =>
    ['profile', 'savedChallenges', userId] as const,

  // Resources
  resources: ['resources'] as const,
  resourceList: (filters?: unknown) => ['resources', 'list', filters] as const,
  resourceDetail: (id: string) => ['resources', 'detail', id] as const,

  // Roadmap
  roadmap: ['roadmap'] as const,
  learningPaths: ['roadmap', 'paths'] as const,
  pathDetail: (id: string) => ['roadmap', 'path', id] as const,

  // Feedback
  feedback: ['feedback'] as const,
  submissionFeedback: (submissionId: string) =>
    ['feedback', 'submission', submissionId] as const,
} as const
