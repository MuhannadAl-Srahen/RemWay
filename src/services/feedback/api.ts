import { supabase } from '@/lib/supabaseClient'
import type {
  FeedbackResponse,
  FeedbackStatus,
} from '@/types/feedback'
import type { ChallengeSubmission } from '@/types/challenge'

export interface SubmissionWithFeedback {
  submission: ChallengeSubmission
  feedback: FeedbackResponse | null
  status: FeedbackStatus
  challenge: {
    id: string
    title: string
    difficulty: string
    preview_image: string | null
  }
}

/**
 * Fetch submission details with feedback and challenge info
 */
export const getSubmissionFeedback = async (
  submissionId: string
): Promise<SubmissionWithFeedback | null> => {
  try {
    // Fetch submission with related challenge data
    const { data: submissionData, error: submissionError } = await supabase
      .from('challenge_submissions')
      .select(
        `
        *,
        challenges (
          id,
          title,
          difficulty,
          preview_image
        )
      `
      )
      .eq('id', submissionId)
      .single()

    if (submissionError) {
      console.error('[getSubmissionFeedback] submission error:', submissionError)
      return null
    }

    if (!submissionData) {
      console.warn('[getSubmissionFeedback] no submission found:', submissionId)
      return null
    }

    // Fetch feedback if it exists
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('challenge_feedback')
      .select('*')
      .eq('submission_id', submissionId)
      .maybeSingle()

    if (feedbackError) {
      console.error('[getSubmissionFeedback] feedback error:', feedbackError)
    }

    // Type assertion for submission data with relations
    const submission = submissionData as any

    // Determine status based on feedback existence
    let status: FeedbackStatus = 'pending'
    if (feedbackData) {
      status = 'completed'
    } else if (submission.status === 'pending') {
      // Check if submission is recent (within 5 minutes)
      const submittedAt = new Date(submission.submitted_at)
      const now = new Date()
      const diffInMinutes = (now.getTime() - submittedAt.getTime()) / 1000 / 60

      status = diffInMinutes < 5 ? 'processing' : 'pending'
    }

    const submissionFormatted: ChallengeSubmission = {
      id: submission.id,
      user_id: submission.user_id,
      challenge_id: submission.challenge_id,
      submission_url: submission.submission_url,
      github_url: submission.github_url,
      live_url: submission.live_url,
      description: submission.description,
      screenshots: submission.screenshots,
      submitted_at: submission.submitted_at,
      score: submission.score,
      status: submission.status,
    }

    // Type assertion for feedback data
    const feedback = feedbackData as any

    return {
      submission: submissionFormatted,
      feedback: feedbackData
        ? {
            id: feedback.id,
            submission_id: feedback.submission_id,
            overall_score: feedback.overall_score,
            design_accuracy: feedback.design_accuracy,
            code_quality: feedback.code_quality,
            responsiveness: feedback.responsiveness,
            accessibility: feedback.accessibility,
            comments: feedback.comments,
            suggestions: feedback.suggestions || [],
            ai_generated: feedback.ai_generated,
            reviewer_id: feedback.reviewer_id,
            created_at: feedback.created_at,
          }
        : null,
      status,
      challenge: {
        id: submission.challenges?.id || '',
        title: submission.challenges?.title || 'Unknown Challenge',
        difficulty: submission.challenges?.difficulty || 'medium',
        preview_image: submission.challenges?.preview_image || null,
      },
    }
  } catch (err) {
    console.error('[getSubmissionFeedback] unexpected error:', err)
    return null
  }
}

/**
 * Check if user owns the submission
 */
export const verifySubmissionOwnership = async (
  submissionId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('challenge_submissions')
      .select('user_id')
      .eq('id', submissionId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return true
  } catch (err) {
    console.error('[verifySubmissionOwnership] error:', err)
    return false
  }
}
