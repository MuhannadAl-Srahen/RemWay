/**
 * URL and Submission Validation Utilities
 * Validates URLs and submission data before AI analysis
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate if a URL is a valid GitHub repository URL
 */
export const isValidGitHubUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false

  // Must contain github.com
  if (!url.includes('github.com')) return false

  // Must match pattern: github.com/owner/repo
  const githubPattern =
    /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+\/?.*$/
  return githubPattern.test(url)
}

/**
 * Validate if a URL is a valid live site URL
 */
export const isValidLiveSiteUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false

  try {
    const parsed = new URL(url)
    // Must be http or https
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    // Must have a valid domain (not localhost in production)
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return false // Don't accept localhost URLs
    }
    return true
  } catch {
    return false
  }
}

/**
 * Check if URL looks like a fake/placeholder URL
 */
export const isSuspiciousUrl = (url: string): boolean => {
  if (!url) return true

  const suspiciousPatterns = [
    /example\.(com|org|net)/i,
    /test\.(com|org|net)/i,
    /fake\./i,
    /placeholder\./i,
    /asdf/i,
    /qwerty/i,
    /\.test$/i,
    /\.local$/i,
    /lorem/i,
    // Random looking domains
    /[a-z]{10,}\.(com|org|net|au|us|uk)/i,
  ]

  return suspiciousPatterns.some((pattern) => pattern.test(url))
}

/**
 * Check if a live site URL is accessible (returns status)
 * This is a lightweight check - just tries to fetch headers
 */
export const checkLiveSiteAccessibility = async (
  url: string
): Promise<{
  accessible: boolean
  statusCode?: number
  error?: string
}> => {
  if (!url || !isValidLiveSiteUrl(url)) {
    return { accessible: false, error: 'Invalid URL format' }
  }

  try {
    // Use a CORS proxy or just do a simple fetch with no-cors
    // Since we're in the browser, we can't reliably check most sites due to CORS
    // But we can at least try and catch obvious failures
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // This won't give us status but at least tries the connection
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // With no-cors, we can't read the response, but if we get here without error,
    // the server at least responded
    return { accessible: true }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          accessible: false,
          error: 'Request timed out - site may be slow or unreachable',
        }
      }
      return { accessible: false, error: error.message }
    }
    return { accessible: false, error: 'Failed to reach the site' }
  }
}

/**
 * Validate a submission before AI analysis
 */
export const validateSubmission = (submission: {
  github_url: string
  live_site_url?: string | null
  challenge?: {
    title: string
  }
}): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate GitHub URL
  if (!submission.github_url) {
    errors.push('GitHub repository URL is required')
  } else if (!isValidGitHubUrl(submission.github_url)) {
    errors.push(
      `Invalid GitHub URL: "${submission.github_url}". Must be a valid GitHub repository URL (e.g., https://github.com/username/repo)`
    )
  }

  // Validate live site URL if provided
  if (submission.live_site_url) {
    if (!isValidLiveSiteUrl(submission.live_site_url)) {
      warnings.push(
        `Invalid live site URL: "${submission.live_site_url}". AI analysis will proceed without live site verification.`
      )
    } else if (isSuspiciousUrl(submission.live_site_url)) {
      warnings.push(
        `Live site URL appears to be a placeholder or test URL. AI analysis may be less accurate.`
      )
    }
  }

  // Check for suspicious GitHub URLs (valid format but likely fake)
  if (submission.github_url && isValidGitHubUrl(submission.github_url)) {
    if (isSuspiciousUrl(submission.github_url)) {
      warnings.push(
        `GitHub URL appears suspicious. Please ensure this is a real repository.`
      )
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Generate a validation error feedback response
 */
export const generateValidationErrorFeedback = (
  errors: string[],
  warnings: string[]
) => {
  return {
    overallScore: 0,
    overallRating: 'needs_improvement' as const,
    whatYouDidWell: [],
    areasForImprovement: [
      'Please submit a valid GitHub repository URL',
      ...errors,
    ],
    designComparison: {
      matchesDesign: false,
      designNotes: ['Unable to analyze - invalid submission URLs'],
    },
    techAnalysis: {
      bestPractices: [
        {
          category: 'Submission',
          description: 'Invalid GitHub URL provided',
          status: 'error' as const,
        },
      ],
      codeFormatting: [],
      functionality: [],
      accessibility: [],
    },
    recommendations: {
      nextChallenges: [],
      learningResources: [
        {
          title: 'How to Submit a Challenge',
          url: 'https://pexfect.com/help/submission-guide',
          type: 'documentation',
        },
      ],
    },
    submissionMismatch: {
      isMismatched: true,
      expectedProject: 'Valid GitHub Repository',
      actualProject: 'Invalid URL',
      explanation: errors.join('. '),
    },
    validationErrors: errors,
    validationWarnings: warnings,
  }
}
