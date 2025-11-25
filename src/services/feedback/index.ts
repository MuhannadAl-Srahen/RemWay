// Components
export { FeedbackHeader } from './components/FeedbackHeader'
export { OverallAnalysis } from './components/OverallAnalysis'
export { DesignComparison } from './components/DesignComparison'
export { TechAnalysis } from './components/TechAnalysis'
export { Recommendations } from './components/Recommendations'
export { MismatchWarning } from './components/MismatchWarning'
export { ImprovementsFromPrevious } from './components/ImprovementsFromPrevious'
export {
  FeedbackLoading,
  FeedbackProcessing,
  FeedbackError,
} from './components/FeedbackStates'

// Hooks
export { useSubmissionFeedback } from './hooks/useSubmissionFeedback'

// API
export {
  getSubmissionFeedback,
  verifySubmissionOwnership,
  getPreviousSubmission,
  generateAndStoreFeedback,
  triggerFeedbackGeneration,
} from './api'
export type { SubmissionWithFeedback } from './api'
