export { generateAIFeedback } from './api'
export type { AIFeedbackRequest, AIFeedbackResponse } from './api'
export {
  fetchRepositoryCode,
  formatCodeForAI,
  parseGitHubUrl,
} from './githubFetcher'
export {
  validateSubmission,
  generateValidationErrorFeedback,
  isValidGitHubUrl,
  isValidLiveSiteUrl,
  isSuspiciousUrl,
  checkLiveSiteAccessibility,
} from './validation'
export type { ValidationResult } from './validation'
