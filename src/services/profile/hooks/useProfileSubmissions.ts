import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/services/challenges/hooks/useAuth'
import { STALE_TIME, CACHE_VALIDITY } from '@/lib/queryConfig'
import { PASSING_SCORE } from '@/lib/constants'

export interface ProfileSubmission {
  id: string
  challengeId: string
  challengeTitle: string
  githubUrl: string
  liveUrl: string | null
  submittedAt: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  score: number | null
  thumbnailUrl: string | null
}

/**
 * Helper to check if a submission passes (score >= PASSING_SCORE)
 */
export const isPassingSubmission = (submission: ProfileSubmission): boolean => {
  return submission.score !== null && submission.score >= PASSING_SCORE
}

interface DbSubmission {
  id: string
  challenge_id: string
  challenge_title: string
  github_url: string
  live_site_url: string | null
  submitted_at: string | null
  challenge_feedback: Array<{
    overall_score: number
  }>
  challenges: {
    difficulty: string
    tags: string[]
    thumbnail_url: string | null
  } | null
}

/**
 * Fetches the user's recent challenge submissions with feedback scores
 */
export const useProfileSubmissions = (limit: number = 20) => {
  const { data: authData } = useAuth()
  const userId = authData?.session?.user?.id

  return useQuery<ProfileSubmission[], Error>({
    queryKey: ['profile-submissions', userId, limit],
    queryFn: async (): Promise<ProfileSubmission[]> => {
      if (!userId) return []

      // Fetch submissions with joined challenge data and feedback
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select(
          `
          id,
          challenge_id,
          challenge_title,
          github_url,
          live_site_url,
          submitted_at,
          challenge_feedback!inner (
            overall_score
          ),
          challenges!inner (
            difficulty,
            tags,
            thumbnail_url
          )
        `
        )
        .eq('profile_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('[useProfileSubmissions] Error:', error)
        throw error
      }

      if (!data) return []

      // Map to ProfileSubmission type - handle feedback as array or single object
      return (data as unknown as DbSubmission[]).map((sub) => {
        // Get the feedback score - handle both array and single object cases
        const feedbackData = sub.challenge_feedback
        let score: number | null = null

        if (Array.isArray(feedbackData) && feedbackData.length > 0) {
          score = feedbackData[0]?.overall_score ?? null
        } else if (feedbackData && typeof feedbackData === 'object') {
          // Handle case where Supabase returns single object instead of array
          score =
            (feedbackData as unknown as { overall_score: number })
              ?.overall_score ?? null
        }

        return {
          id: sub.id,
          challengeId: sub.challenge_id,
          challengeTitle: sub.challenge_title,
          githubUrl: sub.github_url,
          liveUrl: sub.live_site_url,
          submittedAt: sub.submitted_at || new Date().toISOString(),
          difficulty: (sub.challenges?.difficulty || 'Beginner') as
            'Beginner' | 'Intermediate' | 'Advanced',
          tags: sub.challenges?.tags || [],
          score,
          thumbnailUrl: sub.challenges?.thumbnail_url || null,
        }
      })
    },
    staleTime: STALE_TIME.SHORT, // 30 seconds
    gcTime: CACHE_VALIDITY.MEDIUM, // 10 minutes
    enabled: !!userId,
  })
}

/**
 * Fetches all submissions for calculating stats (without pagination)
 */
export const useAllProfileSubmissions = () => {
  const { data: authData } = useAuth()
  const userId = authData?.session?.user?.id

  return useQuery<ProfileSubmission[], Error>({
    queryKey: ['all-profile-submissions', userId],
    queryFn: async (): Promise<ProfileSubmission[]> => {
      if (!userId) return []

      // Fetch submissions with feedback using inner join to only get submissions with feedback
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select(
          `
          id,
          challenge_id,
          challenge_title,
          github_url,
          live_site_url,
          submitted_at,
          challenge_feedback!inner (
            overall_score
          ),
          challenges (
            difficulty,
            tags,
            thumbnail_url
          )
        `
        )
        .eq('profile_id', userId)
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('[useAllProfileSubmissions] Error:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.log(
          '[useAllProfileSubmissions] No submissions found for user:',
          userId
        )
        return []
      }

      console.log('[useAllProfileSubmissions] Raw data:', data)

      // Map to ProfileSubmission type - handle feedback as array or single object
      return (data as unknown as DbSubmission[]).map((sub) => {
        // Get the feedback score - handle both array and single object cases
        const feedbackData = sub.challenge_feedback
        let score: number | null = null

        if (Array.isArray(feedbackData) && feedbackData.length > 0) {
          score = feedbackData[0]?.overall_score ?? null
        } else if (feedbackData && typeof feedbackData === 'object') {
          // Handle case where Supabase returns single object instead of array
          score =
            (feedbackData as unknown as { overall_score: number })
              ?.overall_score ?? null
        }

        return {
          id: sub.id,
          challengeId: sub.challenge_id,
          challengeTitle: sub.challenge_title,
          githubUrl: sub.github_url,
          liveUrl: sub.live_site_url,
          submittedAt: sub.submitted_at || new Date().toISOString(),
          difficulty: (sub.challenges?.difficulty || 'Beginner') as
            'Beginner' | 'Intermediate' | 'Advanced',
          tags: sub.challenges?.tags || [],
          score,
          thumbnailUrl: sub.challenges?.thumbnail_url || null,
        }
      })
    },
    staleTime: STALE_TIME.MEDIUM, // 2 minutes
    gcTime: CACHE_VALIDITY.MEDIUM, // 10 minutes
    enabled: !!userId,
  })
}
