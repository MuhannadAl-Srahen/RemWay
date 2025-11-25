import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ChallengeSubmissionWithChallenge } from '@/types/feedback'
import { fetchRepositoryCode, formatCodeForAI } from './githubFetcher'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export interface PreviousFeedbackSummary {
  previous_score: number
  issues_to_fix: string[]
  previous_best_practices: string[]
  previous_code_formatting: string[]
  previous_functionality: string[]
  previous_accessibility: string[]
}

export interface AIFeedbackRequest {
  submission: ChallengeSubmissionWithChallenge
  previousSubmission?: ChallengeSubmissionWithChallenge
  previousFeedback?: PreviousFeedbackSummary // Previous feedback for comparison on resubmission
  challengeDescription: string
  designRequirements: string[]
  techRequirements: string[]
}

export interface AIFeedbackResponse {
  overallScore: number
  overallRating: 'excellent' | 'good' | 'needs_improvement'
  whatYouDidWell: string[]
  areasForImprovement: string[]
  designComparison: {
    matchesDesign: boolean
    designNotes: string[]
  }
  techAnalysis: {
    bestPractices: Array<{
      category: string
      description: string
      status: 'good' | 'warning' | 'error'
    }>
    codeFormatting: Array<{
      category: string
      description: string
      status: 'good' | 'warning' | 'error'
    }>
    functionality: Array<{
      category: string
      description: string
      status: 'good' | 'warning' | 'error'
    }>
    accessibility: Array<{
      category: string
      description: string
      status: 'good' | 'warning' | 'error'
    }>
  }
  recommendations: {
    nextChallenges: Array<{
      id: string
      title: string
      difficulty: string
    }>
    learningResources: Array<{
      title: string
      url: string
      type: string
    }>
  }
  comparisonNotes?: {
    improvements: string[]
    regressions: string[]
    newSkills: string[]
  }
  // Track improvements from previous feedback (on resubmission)
  improvementsFromPrevious?: {
    issuesFixed: Array<{
      issue: string
      wasFixed: boolean
      details: string
    }>
    previousScore: number
    scoreImprovement: number
    overallAssessment: string
  }
  // Mismatch detection - when submitted code doesn't match the challenge
  submissionMismatch?: {
    isMismatched: boolean
    expectedProject: string
    actualProject: string
    explanation: string
  }
}

const SYSTEM_PROMPT = `You are an expert frontend development mentor providing detailed, constructive feedback on coding challenge submissions. You must analyze the submission and provide precise, actionable feedback.

CRITICAL: First, verify that the submitted code/project MATCHES the challenge. If the user submits a completely different project (e.g., a recipe card for a profile card challenge), you MUST:
1. Set "submissionMismatch.isMismatched" to true
2. Give a very low score (0-20) since the submission doesn't match
3. Explain clearly in the feedback that the wrong project was submitted

Your feedback should be:
1. **Precise**: Point to specific code patterns, design elements, or functionality
2. **Constructive**: Balance positive reinforcement with areas for growth
3. **Educational**: Explain WHY something is good or needs improvement
4. **Actionable**: Provide clear next steps

Scoring Guidelines (for matching submissions):
- 90-100 (Excellent): Production-ready code, follows all best practices, excellent UX
- 75-89 (Good): Solid implementation, minor improvements possible
- 60-74 (Needs Improvement): Core functionality works but has notable issues
- Below 60: Significant problems that need addressing
- 0-20: Wrong project submitted (mismatch)

Response Format: Return a valid JSON object matching the AIFeedbackResponse interface.`

export const generateAIFeedback = async (
  request: AIFeedbackRequest
): Promise<AIFeedbackResponse> => {
  const maxRetries = 2
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[generateAIFeedback] Attempt ${attempt}/${maxRetries}`)

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      })

      // Fetch actual code from GitHub if URL is provided
      let codeAnalysis = ''
      if (request.submission.github_url) {
        console.log('[generateAIFeedback] Fetching code from GitHub...')
        const repoCode = await fetchRepositoryCode(
          request.submission.github_url
        )

        if (repoCode) {
          codeAnalysis = formatCodeForAI(repoCode)
          console.log(
            `[generateAIFeedback] Fetched ${repoCode.files.length} files (${(repoCode.totalSize / 1024).toFixed(1)}KB)`
          )
        } else {
          console.warn(
            '[generateAIFeedback] Could not fetch GitHub code, proceeding with URL-only analysis'
          )
        }
      }

      const prompt = buildPrompt(request, codeAnalysis)

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      })

      const response = result.response
      const text = response.text()

      console.log(
        '[generateAIFeedback] 📄 Raw AI response length:',
        text.length,
        'chars'
      )
      console.log(
        '[generateAIFeedback] 📄 First 500 chars:',
        text.substring(0, 500)
      )
      console.log(
        '[generateAIFeedback] 📄 Last 200 chars:',
        text.substring(Math.max(0, text.length - 200))
      )

      // Check if response looks truncated
      if (!text.trim().endsWith('}')) {
        console.warn(
          "[generateAIFeedback] ⚠️ Response appears truncated (doesn't end with })"
        )
      }

      // Parse and validate the response
      let feedback: AIFeedbackResponse
      try {
        feedback = JSON.parse(text) as AIFeedbackResponse
      } catch (parseError) {
        console.error('[generateAIFeedback] ❌ JSON parse failed:', parseError)
        console.error('[generateAIFeedback] Response length:', text.length)
        console.error(
          '[generateAIFeedback] Response ends with:',
          text.substring(Math.max(0, text.length - 100))
        )

        // Try to salvage partial response by attempting to close JSON
        if (text.includes('{') && !text.trim().endsWith('}')) {
          console.warn(
            '[generateAIFeedback] Attempting to repair truncated JSON...'
          )
          const fixedText = text.trim().replace(/,\s*$/, '') + '}'
          try {
            feedback = JSON.parse(fixedText) as AIFeedbackResponse
            console.log('[generateAIFeedback] ✅ Repaired JSON successfully')
          } catch {
            throw new Error(
              'Failed to parse AI response as JSON - response was truncated'
            )
          }
        } else {
          throw new Error('Failed to parse AI response as JSON')
        }
      }

      console.log('[generateAIFeedback] ✅ Parsed feedback structure:', {
        hasScore: !!feedback.overallScore,
        hasRating: !!feedback.overallRating,
        hasWhatYouDidWell: !!feedback.whatYouDidWell,
        whatYouDidWellCount: feedback.whatYouDidWell?.length || 0,
        hasAreasForImprovement: !!feedback.areasForImprovement,
        areasCount: feedback.areasForImprovement?.length || 0,
        hasTechAnalysis: !!feedback.techAnalysis,
        techKeys: feedback.techAnalysis
          ? Object.keys(feedback.techAnalysis)
          : [],
      })

      // Validate required fields
      if (
        !feedback.overallScore ||
        !feedback.whatYouDidWell ||
        !feedback.areasForImprovement
      ) {
        console.error('[generateAIFeedback] ❌ Missing required fields')
        throw new Error('Invalid AI response: missing required fields')
      }

      // Ensure techAnalysis has the expected structure
      if (!feedback.techAnalysis) {
        console.warn(
          '[generateAIFeedback] ⚠️ No techAnalysis in response, creating empty structure'
        )
        feedback.techAnalysis = {
          bestPractices: [],
          codeFormatting: [],
          functionality: [],
          accessibility: [],
        }
      }

      return feedback
    } catch (error) {
      lastError = error as Error
      console.error(`[generateAIFeedback] Attempt ${attempt} failed:`, error)

      // Don't retry on parse errors, only network errors
      if (error instanceof Error && !error.message.includes('Network')) {
        throw error
      }

      if (attempt < maxRetries) {
        const delay = attempt * 2000 // 2s, 4s
        console.log(`[generateAIFeedback] Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // All retries failed
  console.error('[generateAIFeedback] All retry attempts failed')
  throw lastError || new Error('Failed to generate AI feedback')
}

const buildPrompt = (
  request: AIFeedbackRequest,
  codeAnalysis: string
): string => {
  const {
    submission,
    previousSubmission,
    previousFeedback,
    challengeDescription,
    designRequirements,
    techRequirements,
  } = request

  // Build comparison section if previous submission exists
  let comparisonSection = ''
  if (previousSubmission) {
    comparisonSection = `
**Previous Submission (for comparison):**
GitHub: ${previousSubmission.github_url}
${previousSubmission.live_site_url ? `Live: ${previousSubmission.live_site_url}` : ''}
Submitted: ${new Date(previousSubmission.submitted_at).toLocaleDateString()}

Compare this new submission against the previous one and include "comparisonNotes" in your response.
`
  }

  // Build previous feedback section if available (for resubmission comparison)
  let previousFeedbackSection = ''
  if (previousFeedback) {
    previousFeedbackSection = `
**IMPORTANT - PREVIOUS FEEDBACK TO ADDRESS:**
This is a RESUBMISSION. The user previously submitted this challenge and received feedback.
Previous Score: ${previousFeedback.previous_score}/100

**Issues That Were Asked To Fix:**
${previousFeedback.issues_to_fix.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

**Previous Code Issues:**
Best Practices: ${previousFeedback.previous_best_practices.slice(0, 3).join('; ')}
Code Formatting: ${previousFeedback.previous_code_formatting.slice(0, 3).join('; ')}
Functionality: ${previousFeedback.previous_functionality.slice(0, 3).join('; ')}
Accessibility: ${previousFeedback.previous_accessibility.slice(0, 3).join('; ')}

**YOUR TASK:** Carefully check if the user has fixed the issues mentioned above. 
Include "improvementsFromPrevious" in your response to track what was fixed vs what still needs work.
`
  }

  const prompt = `Analyze this frontend challenge submission:

**Challenge:** ${submission.challenge.title} (${submission.challenge.difficulty})
${challengeDescription}

**Requirements:**
Design: ${designRequirements.join(', ')}
Technical: ${techRequirements.join(', ')}

**Current Submission:**
GitHub: ${submission.github_url}
${submission.live_site_url ? `Live Site: ${submission.live_site_url}` : ''}
${comparisonSection}
${previousFeedbackSection}
${codeAnalysis ? `**Source Code:**\n${codeAnalysis}\n` : `**Note:** Source code not available (GitHub rate limit or private repo). Base analysis on live site: ${submission.live_site_url}\n`}

**CRITICAL - MISMATCH CHECK:**
First, verify the submitted code/project actually implements "${submission.challenge.title}".
If the code is for a DIFFERENT project (e.g., recipe card instead of profile card), this is a MISMATCH.
Set submissionMismatch.isMismatched=true and give score 0-20.

**Scoring Criteria:**
- Design (30%): Visual accuracy, responsive, UI/UX
- Code (30%): Clean structure, naming, organization
- Functionality (25%): Features work, error handling
- Accessibility (15%): Semantic HTML, ARIA, keyboard nav

${submission.live_site_url ? `**IMPORTANT:** Visit the live site URL to verify the design implementation matches the challenge requirements and the site functions correctly.` : ''}

Return JSON with:
{
  "overallScore": 0-100,
  "overallRating": "excellent"|"good"|"needs_improvement",
  "whatYouDidWell": ["3-5 concise positives"],
  "areasForImprovement": ["3-5 concise improvements"],
  "designComparison": {
    "matchesDesign": boolean,
    "designNotes": ["brief design feedback items"]
  },
  "techAnalysis": {
    "bestPractices": [{"category": "name", "description": "brief", "status": "good"|"warning"|"error"}],
    "codeFormatting": [{"category": "name", "description": "brief", "status": "good"|"warning"|"error"}],
    "functionality": [{"category": "name", "description": "brief", "status": "good"|"warning"|"error"}],
    "accessibility": [{"category": "name", "description": "brief", "status": "good"|"warning"|"error"}]
  },
  "recommendations": {
    "nextChallenges": [{"id": "", "title": "name", "difficulty": "level"}],
    "learningResources": [{"title": "name", "url": "link", "type": "documentation"}]
  },
  "submissionMismatch": {
    "isMismatched": false,
    "expectedProject": "${submission.challenge.title}",
    "actualProject": "detected project name from code",
    "explanation": "why it matches or doesn't match"
  }${
    previousSubmission
      ? `,
  "comparisonNotes": {
    "improvements": ["what got better from previous submission"],
    "regressions": ["what got worse, if any"],
    "newSkills": ["new skills demonstrated in this submission"]
  }`
      : ''
  }${
    previousFeedback
      ? `,
  "improvementsFromPrevious": {
    "issuesFixed": [
      {"issue": "the specific issue from previous feedback", "wasFixed": true|false, "details": "explanation of fix or what still needs work"}
    ],
    "previousScore": ${previousFeedback.previous_score},
    "scoreImprovement": "new_score - ${previousFeedback.previous_score}",
    "overallAssessment": "Great job fixing X issues! Still need to work on Y." or "Keep working on the previous issues."
  }`
      : ''
  }
}

Keep responses concise. Limit each array to 3-5 items max.`

  return prompt
}
