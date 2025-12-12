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

export interface FeedbackResponse {
  id: string
  submission_id: string
  overall_score: number
  overall_rating: string
  overall_good_practices: string[]
  improvment_advices: string[]
  best_practices: TechAnalysisItem[]
  code_formatting: TechAnalysisItem[]
  functionality: TechAnalysisItem[]
  accessibility: TechAnalysisItem[]
  recommended_resources: any
  recommended_next_challenge: string | null
  comparison_notes: any
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
