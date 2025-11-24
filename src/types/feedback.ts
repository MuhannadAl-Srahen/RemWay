export interface FeedbackRequest {
  submissionId: string
  userId: string
  challengeId: string
  submissionUrl: string
  githubUrl?: string
  liveUrl?: string
  description?: string
}

export interface FeedbackResponse {
  id: string
  submission_id: string
  overall_score: number
  design_accuracy: number
  code_quality: number
  responsiveness: number
  accessibility: number
  comments: string
  suggestions: string[]
  ai_generated: boolean
  reviewer_id?: string
  created_at: string
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
