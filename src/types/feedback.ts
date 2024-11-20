// ============================================================================
// FEEDBACK TYPES
// ============================================================================

export interface Feedback {
  id: string
  submissionId: string
  challengeId: string
  userId: string
  reviewerId?: string
  content: string
  rating: number
  suggestions: string[]
  createdAt: string
  updatedAt: string
  status: FeedbackStatus
}

export type FeedbackStatus = 'pending' | 'reviewed' | 'addressed'

export interface SubmissionFeedback {
  overall: number
  codeQuality: number
  design: number
  functionality: number
  responsiveness: number
  comments: FeedbackComment[]
}

export interface FeedbackComment {
  id: string
  line?: number
  file?: string
  comment: string
  type: 'suggestion' | 'issue' | 'praise'
  resolved: boolean
}
