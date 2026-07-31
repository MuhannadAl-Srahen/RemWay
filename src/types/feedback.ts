export interface FeedbackRequest {
  submissionId: string
  userId: string
  challengeId: string
  submissionUrl: string
  githubUrl?: string
  liveUrl?: string
  description?: string
}

export interface TechAnalysisItem {
  category: string
  description: string
  status: 'good' | 'warning' | 'error'
}

/**
 * A single entry in one of the stored tech-analysis columns. Current rows hold
 * pre-formatted strings; legacy rows may hold the raw object.
 */
export type FeedbackAnalysisEntry = string | TechAnalysisItem

/**
 * A learning resource stored in `challenge_feedback.recommended_resources`.
 *
 * Written from `AIFeedbackResponse.recommendations.learningResources`, so the
 * model controls the contents. Every field is optional because the column is
 * raw JSON and older rows predate the current shape — consumers must fall back
 * (see the mapping in routes/feedback/$submissionId.tsx).
 */
export interface RecommendedResource {
  title?: string
  description?: string
  url?: string
  type?: string
}

/**
 * Stored in `challenge_feedback.comparison_notes`, written from
 * `AIFeedbackResponse.comparisonNotes` when a submission is a resubmission.
 * Null for first attempts.
 */
export interface ComparisonNotes {
  improvements?: string[]
  regressions?: string[]
  newSkills?: string[]
}

export interface FeedbackResponse {
  id: string
  submission_id: string
  overall_score: number
  overall_rating: string
  overall_good_practices: string[]
  improvment_advices: string[]
  /**
   * The four tech-analysis columns are written as pre-formatted strings
   * ("category: description (status)") by both write paths in
   * services/feedback/api.ts, and the DB columns are `string[]`. Older rows
   * may still hold raw TechAnalysisItem objects, which is why the renderer
   * (parseFeedbackItems in routes/feedback/$submissionId.tsx) accepts both.
   * Typing the union keeps consumers honest about that.
   */
  best_practices: FeedbackAnalysisEntry[]
  code_formatting: FeedbackAnalysisEntry[]
  functionality: FeedbackAnalysisEntry[]
  accessibility: FeedbackAnalysisEntry[]
  recommended_resources: RecommendedResource[] | null
  recommended_next_challenge: string | null
  comparison_notes: ComparisonNotes | null
  ai_model_version: string | null
  created_at: string
  // Mismatch detection
  submission_mismatch?: {
    is_mismatched: boolean
    expected_project: string
    actual_project: string
    explanation: string
  } | null
  // Previous feedback summary (for resubmissions)
  previous_feedback_summary?: {
    previous_score: number
    issues_to_fix: string[]
  } | null
  // Improvements tracking from AI analysis
  improvements_from_previous?: {
    issues_fixed: Array<{
      issue: string
      was_fixed: boolean
      details: string
    }>
    previous_score: number
    score_improvement: number
    overall_assessment: string
  } | null
}

export interface FeedbackMetrics {
  overall_score: number
  design_accuracy: number
  code_quality: number
  responsiveness: number
  accessibility: number
}

export interface FeedbackComment {
  category: string
  severity: 'info' | 'warning' | 'error'
  message: string
  suggestion?: string
}

export type FeedbackStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ChallengeSubmissionWithChallenge {
  id: string
  challenge_id: string
  profile_id: string
  challenge_title: string
  github_url: string
  live_site_url: string | null
  screenshots: string[] | null
  submission_description: string | null
  submitted_at: string
  previous_submission_id: string | null
  challenge: {
    id: string
    title: string
    difficulty: string
    description: string
    thumbnail_url: string | null
    requirements?: string[]
  }
}
