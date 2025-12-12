import type {
  PostgrestQueryBuilder,
  PostgrestFilterBuilder,
} from '@supabase/postgrest-js'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      challenge_submissions: {
        Row: {
          challenge_id: string
          challenge_title: string
          github_url: string
          id: string
          live_site_url: string
          previous_submission_id: string | null
          profile_id: string
          screenshots: string[] | null
          submission_description: string | null
          submitted_at: string | null
        }
        Insert: {
          challenge_id: string
          challenge_title: string
          github_url: string
          id?: string
          live_site_url: string
          previous_submission_id?: string | null
          profile_id: string
          screenshots?: string[] | null
          submission_description?: string | null
          submitted_at?: string | null
        }
        Update: {
          challenge_id?: string
          challenge_title?: string
          github_url?: string
          id?: string
          live_site_url?: string
          previous_submission_id?: string | null
          profile_id?: string
          screenshots?: string[] | null
          submission_description?: string | null
          submitted_at?: string | null
        }
      }
      challenge_feedback: {
        Row: {
          accessibility: string[]
          ai_model_version: string | null
          best_practices: string[] | null
          code_formatting: string[]
          comparison_notes: Json | null
          created_at: string | null
          feedback_generation_time: number | null
          functionality: string[]
          id: string
          improvment_advices: string[] | null
          live_preview: string
          overall_analysis_description: Json
          overall_good_practices: string[]
          overall_rating: string
          overall_score: number
          recommended_next_challenge: string | null
          recommended_resources: Json | null
          submission_id: string
          view_code: string
        }
        Insert: {
          accessibility: string[]
          ai_model_version?: string | null
          best_practices?: string[] | null
          code_formatting: string[]
          comparison_notes?: Json | null
          created_at?: string | null
          feedback_generation_time?: number | null
          functionality: string[]
          id?: string
          improvment_advices?: string[] | null
          live_preview: string
          overall_analysis_description: Json
          overall_good_practices: string[]
          overall_rating: string
          overall_score: number
          recommended_next_challenge?: string | null
          recommended_resources?: Json | null
          submission_id: string
          view_code: string
        }
      }
    }
  }
}

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
