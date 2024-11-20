/**
 * Centralized query configuration constants
 * Use these to ensure consistent caching behavior across the app
 */

/**
 * Standard stale times for different types of data
 */
export const STALE_TIME = {
  // User auth state - relatively stable, check every 5 minutes
  AUTH: 1000 * 60 * 5, // 5 minutes

  // User profile - changes infrequently
  PROFILE: 1000 * 60 * 5, // 5 minutes

  // Challenges list - static data, can be cached longer
  CHALLENGES: 1000 * 60 * 10, // 10 minutes

  // Challenge detail - static data, can be cached longer
  CHALLENGE_DETAIL: 1000 * 60 * 10, // 10 minutes

  // Saved challenges - user-specific, shorter cache
  SAVED_CHALLENGES: 1000 * 60 * 2, // 2 minutes

  // Resources - static data, can be cached longer
  RESOURCES: 1000 * 60 * 15, // 15 minutes

  // Roadmap - static data, can be cached very long
  ROADMAP: 1000 * 60 * 30, // 30 minutes
} as const

/**
 * Cache time for localStorage-backed queries
 */
export const CACHE_VALIDITY = {
  // How long localStorage cache is considered valid
  DEFAULT: 1000 * 60 * 5, // 5 minutes
} as const

/**
 * Retry configuration for queries
 */
export const RETRY_CONFIG = {
  // Auth queries should fail fast
  AUTH: 1,

  // Default retry for most queries
  DEFAULT: 2,

  // Data mutations might need more retries
  MUTATION: 3,
} as const
