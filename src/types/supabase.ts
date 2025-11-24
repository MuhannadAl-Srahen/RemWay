import type {
  PostgrestQueryBuilder,
  PostgrestFilterBuilder,
} from '@supabase/postgrest-js'

/**
 * Type-safe wrapper for Supabase table queries
 * Use this to cast Supabase query builders with proper TypeScript types
 *
 * Example:
 * const { data, error } = await (supabase
 *   .from('challenges')
 *   .select('*') as SupabaseTable)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SupabaseTable = PostgrestQueryBuilder<any, any, any>

/**
 * Type-safe wrapper for Supabase filter builders
 * Use this for more complex queries with filters
 *
 * Example:
 * const query = supabase
 *   .from('challenges')
 *   .select('*') as SupabaseQueryBuilder
 */
export type SupabaseQueryBuilder = PostgrestFilterBuilder<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  'id',
  unknown
>

/**
 * Database-specific types for Supabase tables
 * These match the exact structure in the database including nullable fields
 */

// User profile type for database operations
export interface DbUserProfile {
  id: string
  user_id: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  github_username: string | null
  twitter_username: string | null
  linkedin_url: string | null
  created_at: string
  updated_at: string
}
