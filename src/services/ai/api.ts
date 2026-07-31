import { GoogleGenAI } from '@google/genai'
import type { ChallengeSubmissionWithChallenge } from '@/types/feedback'
import { fetchRepositoryCode, formatCodeForAI } from './githubFetcher'
import {
  isValidLiveSiteUrl,
  isSuspiciousUrl,
  checkLiveSiteAccessibility,
} from './validation'

const MODEL_ID = 'gemini-2.5-pro'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

// Track the status of code fetching for accurate AI analysis
export interface CodeFetchStatus {
  success: boolean
  filesCount: number
  totalSize: number
  error?: string
  hasSourceCode: boolean // True if we got actual source files (not just config)
}

// Track the status of live URL for accurate AI analysis
export interface LiveUrlStatus {
  provided: boolean
  valid: boolean
  accessible: boolean
  error?: string
}

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
  scoreBreakdown?: {
    design: number
    codeQuality: number
    functionality: number
    accessibility: number
  }
  overallRating: 'excellent' | 'good' | 'needs_improvement'
  codeNotAvailable?: boolean // True when code couldn't be fetched - score should be capped
  liveUrlNotAccessible?: boolean // True when live URL is invalid or unreachable
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

CRITICAL RULE #0 - DETERMINISTIC SCORING:
You MUST provide consistent, repeatable scores. The same submission should ALWAYS receive the same score.
- Use the scoring rubric EXACTLY as specified below
- Do NOT introduce randomness or variation
- Base scores ONLY on objective code quality criteria

CRITICAL RULE #1 - CODE AVAILABILITY CHECK:
Before scoring, verify that source code was successfully fetched. Look for the "CODE SUCCESSFULLY FETCHED" or "CODE NOT AVAILABLE" section in the prompt.
- If code was NOT available: Set codeNotAvailable=true, score MUST be 0-30 max
- If no source code FILES found: Set codeNotAvailable=true, score MUST be 0-40 max
- Only give scores above 40 if you have actual source code to analyze

CRITICAL RULE #2 - PROJECT MISMATCH CHECK:
Verify that the submitted code/project MATCHES the challenge. If the user submits a completely different project (e.g., a recipe card for a profile card challenge), you MUST:
1. Set "submissionMismatch.isMismatched" to true
2. Give a very low score (0-20) since the submission doesn't match
3. Explain clearly in the feedback that the wrong project was submitted

Your feedback should be:
1. **Precise**: Point to specific code patterns, design elements, or functionality
2. **Constructive**: Balance positive reinforcement with areas for growth
3. **Educational**: Explain WHY something is good or needs improvement
4. **Actionable**: Provide clear next steps

SCORING RUBRIC (apply consistently):
Design Implementation (30 points max):
- 25-30: Pixel-perfect, responsive, matches design exactly
- 18-24: Good match, minor visual differences
- 10-17: Noticeable differences from design
- 0-9: Significant design issues or doesn't match

Code Quality (30 points max):
- 25-30: Clean, well-organized, follows best practices
- 18-24: Good structure, minor issues
- 10-17: Some organization issues, inconsistent patterns
- 0-9: Poor structure, major issues

Functionality (25 points max):
- 21-25: All features work perfectly
- 15-20: Core features work, minor bugs
- 8-14: Some features broken
- 0-7: Major functionality issues

Accessibility (15 points max):
- 13-15: Excellent semantic HTML, ARIA, keyboard nav
- 9-12: Good accessibility, minor gaps
- 5-8: Basic accessibility
- 0-4: Poor or no accessibility

Total: Add up points from each category. Be consistent!

Response Format: Return a valid JSON object matching the AIFeedbackResponse interface.`

export const generateAIFeedback = async (
  request: AIFeedbackRequest
): Promise<AIFeedbackResponse> => {
  const maxRetries = 2
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[generateAIFeedback] Attempt ${attempt}/${maxRetries}`)

      // Fetch actual code from GitHub if URL is provided
      let codeAnalysis = ''
      let codeFetchStatus: CodeFetchStatus = {
        success: false,
        filesCount: 0,
        totalSize: 0,
        hasSourceCode: false,
      }

      if (request.submission.github_url) {
        console.log('[generateAIFeedback] Fetching code from GitHub...')
        const repoCode = await fetchRepositoryCode(
          request.submission.github_url
        )

        if (repoCode && repoCode.files.length > 0) {
          codeAnalysis = formatCodeForAI(repoCode)

          // Check if we got actual source code (not just config files)
          const sourceExtensions = [
            '.html',
            '.css',
            '.scss',
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
          ]
          const sourceFiles = repoCode.files.filter((f) =>
            sourceExtensions.some((ext) => f.path.toLowerCase().endsWith(ext))
          )

          codeFetchStatus = {
            success: true,
            filesCount: repoCode.files.length,
            totalSize: repoCode.totalSize,
            hasSourceCode: sourceFiles.length > 0,
          }

          console.log(
            `[generateAIFeedback] Fetched ${repoCode.files.length} files (${sourceFiles.length} source files, ${(repoCode.totalSize / 1024).toFixed(1)}KB)`
          )

          if (sourceFiles.length === 0) {
            console.warn(
              '[generateAIFeedback] ⚠️ No source code files found - only config files'
            )
            codeFetchStatus.error =
              'Repository contains no source code files (only config files found)'
          }
        } else {
          codeFetchStatus = {
            success: false,
            filesCount: 0,
            totalSize: 0,
            hasSourceCode: false,
            error:
              'Could not fetch repository code - repository may be private, empty, or URL is incorrect',
          }
          console.warn(
            '[generateAIFeedback] ⚠️ Could not fetch GitHub code:',
            codeFetchStatus.error
          )
        }
      } else {
        codeFetchStatus = {
          success: false,
          filesCount: 0,
          totalSize: 0,
          hasSourceCode: false,
          error: 'No GitHub URL provided',
        }
      }

      // Check live URL accessibility
      const liveUrlStatus: LiveUrlStatus = {
        provided: false,
        valid: false,
        accessible: false,
      }

      if (request.submission.live_site_url) {
        liveUrlStatus.provided = true

        // Check if URL format is valid
        if (!isValidLiveSiteUrl(request.submission.live_site_url)) {
          liveUrlStatus.valid = false
          liveUrlStatus.error = 'Invalid live site URL format'
          console.warn(
            '[generateAIFeedback] ⚠️ Invalid live URL format:',
            request.submission.live_site_url
          )
        } else if (isSuspiciousUrl(request.submission.live_site_url)) {
          liveUrlStatus.valid = true
          liveUrlStatus.accessible = false
          liveUrlStatus.error =
            'Live site URL appears to be a placeholder or test URL'
          console.warn(
            '[generateAIFeedback] ⚠️ Suspicious live URL:',
            request.submission.live_site_url
          )
        } else {
          liveUrlStatus.valid = true

          // Try to check accessibility (best effort due to CORS)
          console.log(
            '[generateAIFeedback] Checking live site accessibility...'
          )
          const accessCheck = await checkLiveSiteAccessibility(
            request.submission.live_site_url
          )
          liveUrlStatus.accessible = accessCheck.accessible

          if (!accessCheck.accessible) {
            liveUrlStatus.error =
              accessCheck.error || 'Live site could not be reached'
            console.warn(
              '[generateAIFeedback] ⚠️ Live site not accessible:',
              accessCheck.error
            )
          } else {
            console.log('[generateAIFeedback] ✅ Live site appears accessible')
          }
        }
      }

      const prompt = buildPrompt(
        request,
        codeAnalysis,
        codeFetchStatus,
        liveUrlStatus
      )

      const result = await ai.models.generateContent({
        model: MODEL_ID,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          // CRITICAL: Use temperature 0 for deterministic, consistent scoring
          // This ensures the same submission always gets the same score
          temperature: 0,
          topK: 1, // Only consider the most likely token
          topP: 1, // Disable nucleus sampling
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      })

      // `text` is a getter on the response and is undefined when the model
      // returned no text parts (e.g. the response was blocked by a safety
      // filter, or the candidate list came back empty).
      const text = result.text
      if (!text) {
        throw new Error(
          'AI returned an empty response (no text parts in the first candidate)'
        )
      }

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
        hasScore: typeof feedback.overallScore === 'number',
        scoreValue: feedback.overallScore,
        hasRating: !!feedback.overallRating,
        hasWhatYouDidWell: Array.isArray(feedback.whatYouDidWell),
        whatYouDidWellCount: feedback.whatYouDidWell?.length || 0,
        hasAreasForImprovement: Array.isArray(feedback.areasForImprovement),
        areasCount: feedback.areasForImprovement?.length || 0,
        hasTechAnalysis: !!feedback.techAnalysis,
        techKeys: feedback.techAnalysis
          ? Object.keys(feedback.techAnalysis)
          : [],
      })

      // Validate required fields - use proper type checks (not truthy) since score can be 0
      if (
        typeof feedback.overallScore !== 'number' ||
        !Array.isArray(feedback.whatYouDidWell) ||
        !Array.isArray(feedback.areasForImprovement)
      ) {
        console.error('[generateAIFeedback] ❌ Missing required fields', {
          scoreType: typeof feedback.overallScore,
          whatYouDidWellIsArray: Array.isArray(feedback.whatYouDidWell),
          areasIsArray: Array.isArray(feedback.areasForImprovement),
        })
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

      // CRITICAL: Enforce score caps based on code availability
      // This prevents the AI from giving high scores when it couldn't actually analyze the code
      if (!codeFetchStatus.success) {
        // No code at all - strict cap at 30
        if (feedback.overallScore > 30) {
          console.warn(
            `[generateAIFeedback] ⚠️ Capping score from ${feedback.overallScore} to 30 - code not available`
          )
          feedback.overallScore = 30
          feedback.codeNotAvailable = true
          feedback.overallRating = 'needs_improvement'

          // Ensure the feedback includes the issue
          if (
            !feedback.areasForImprovement.some((a) =>
              a.toLowerCase().includes('source code')
            )
          ) {
            feedback.areasForImprovement.unshift(
              'Source code could not be fetched from GitHub. Please ensure your repository is public and contains valid source code files.'
            )
          }
        }
      } else if (!codeFetchStatus.hasSourceCode) {
        // Repo fetched but no source code - cap at 40
        if (feedback.overallScore > 40) {
          console.warn(
            `[generateAIFeedback] ⚠️ Capping score from ${feedback.overallScore} to 40 - no source code files`
          )
          feedback.overallScore = 40
          feedback.codeNotAvailable = true
          feedback.overallRating = 'needs_improvement'

          // Ensure the feedback includes the issue
          if (
            !feedback.areasForImprovement.some((a) =>
              a.toLowerCase().includes('source code')
            )
          ) {
            feedback.areasForImprovement.unshift(
              'Repository contains no source code files (.html, .css, .js, .jsx, .ts, .tsx). Please submit a repository with actual code.'
            )
          }
        }
      }

      // Handle live URL issues - apply design score penalty
      // Note: We don't cap the overall score, but ensure the AI accounts for it
      if (
        liveUrlStatus.provided &&
        (!liveUrlStatus.valid || !liveUrlStatus.accessible)
      ) {
        feedback.liveUrlNotAccessible = true

        // Ensure the feedback mentions the live URL issue if not already
        const hasLiveUrlFeedback = feedback.areasForImprovement.some(
          (a) =>
            a.toLowerCase().includes('live site') ||
            a.toLowerCase().includes('live url')
        )

        if (!hasLiveUrlFeedback) {
          if (!liveUrlStatus.valid) {
            feedback.areasForImprovement.push(
              'The provided live site URL is invalid. Please provide a valid URL (e.g., https://your-project.netlify.app).'
            )
          } else if (!liveUrlStatus.accessible) {
            feedback.areasForImprovement.push(
              'The live site URL could not be accessed. Please ensure your deployment is working and publicly accessible.'
            )
          }
        }

        console.log(
          '[generateAIFeedback] ℹ️ Live URL issue flagged:',
          liveUrlStatus.error
        )
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
  codeAnalysis: string,
  codeFetchStatus: CodeFetchStatus,
  liveUrlStatus: LiveUrlStatus
): string => {
  const {
    submission,
    previousSubmission,
    previousFeedback,
    challengeDescription,
    designRequirements,
    techRequirements,
  } = request

  // Build code availability section - CRITICAL for accurate scoring
  let codeAvailabilitySection = ''
  if (!codeFetchStatus.success) {
    codeAvailabilitySection = `
**⚠️ CRITICAL - CODE NOT AVAILABLE:**
Status: FAILED to fetch source code
Reason: ${codeFetchStatus.error || 'Unknown error'}

**SCORING IMPACT - APPLY STRICT PENALTY:**
- Since NO source code could be fetched and analyzed, you CANNOT give a score above 30/100
- Set "codeNotAvailable" to true in your response
- Mark all techAnalysis items as "error" status with "Unable to analyze - code not available"
- In areasForImprovement, include: "Source code could not be fetched from GitHub. Please ensure your repository is public and contains valid source code files."
`
  } else if (!codeFetchStatus.hasSourceCode) {
    codeAvailabilitySection = `
**⚠️ WARNING - NO SOURCE CODE FILES:**
Status: Repository fetched but contains NO source code
Files found: ${codeFetchStatus.filesCount} (only config/documentation files)

**SCORING IMPACT - APPLY PENALTY:**
- The repository contains no actual source code (.html, .css, .js, .jsx, .ts, .tsx files)
- Maximum score allowed: 40/100
- This usually means the wrong repository was submitted or the code is in a different branch
- In areasForImprovement, include: "Repository contains no source code files. Please submit a repository with actual HTML, CSS, and JavaScript/TypeScript code."
`
  } else {
    codeAvailabilitySection = `
**✅ CODE SUCCESSFULLY FETCHED:**
Files analyzed: ${codeFetchStatus.filesCount}
Total size: ${(codeFetchStatus.totalSize / 1024).toFixed(1)}KB
Source code: Available for full analysis
`
  }

  // Build live URL status section
  let liveUrlSection = ''
  if (!liveUrlStatus.provided) {
    liveUrlSection = `
**ℹ️ LIVE SITE URL - NOT PROVIDED:**
No live site URL was submitted. Design comparison will be based on code analysis only.
- Do NOT penalize the score for missing live URL
- Focus analysis on code quality and structure
`
  } else if (!liveUrlStatus.valid) {
    liveUrlSection = `
**⚠️ LIVE SITE URL - INVALID FORMAT:**
Status: The provided live site URL is not valid
URL: ${submission.live_site_url}
Reason: ${liveUrlStatus.error || 'Invalid URL format'}

**SCORING IMPACT:**
- Cannot verify design implementation without valid live URL
- Reduce design score by 10-15 points
- In areasForImprovement, include: "Please provide a valid, accessible live site URL for accurate design feedback."
`
  } else if (!liveUrlStatus.accessible) {
    liveUrlSection = `
**⚠️ LIVE SITE URL - NOT ACCESSIBLE:**
Status: The live site URL could not be reached
URL: ${submission.live_site_url}
Reason: ${liveUrlStatus.error || 'Site unreachable'}

**SCORING IMPACT:**
- Cannot verify design implementation if site is down
- Reduce design score by 10-15 points
- In areasForImprovement, include: "The live site URL could not be accessed. Please ensure your deployment is working and the URL is correct."
`
  } else {
    liveUrlSection = `
**✅ LIVE SITE URL - ACCESSIBLE:**
URL: ${submission.live_site_url}
Status: Site appears to be accessible for design verification
`
  }

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
${codeAvailabilitySection}
${liveUrlSection}
${codeAnalysis ? `**Source Code:**\n${codeAnalysis}\n` : ''}

**CRITICAL - MISMATCH CHECK:**
First, verify the submitted code/project actually implements "${submission.challenge.title}".
If the code is for a DIFFERENT project (e.g., recipe card instead of profile card), this is a MISMATCH.
Set submissionMismatch.isMismatched=true and give score 0-20.

**SCORING - CALCULATE DETERMINISTICALLY:**
Use the rubric from system instructions. Calculate each category score, then sum:
- Design (0-30 points): Visual accuracy, responsive, UI/UX
- Code Quality (0-30 points): Clean structure, naming, organization
- Functionality (0-25 points): Features work, error handling
- Accessibility (0-15 points): Semantic HTML, ARIA, keyboard nav
Total = Design + Code + Functionality + Accessibility (max 100)

Include "scoreBreakdown" in your response showing how you calculated the score.

${submission.live_site_url ? `**IMPORTANT:** Visit the live site URL to verify the design implementation matches the challenge requirements and the site functions correctly.` : ''}

Return JSON with:
{
  "overallScore": 0-100 (MUST equal sum of scoreBreakdown),
  "scoreBreakdown": {
    "design": 0-30,
    "codeQuality": 0-30,
    "functionality": 0-25,
    "accessibility": 0-15
  },
  "overallRating": "excellent"|"good"|"needs_improvement",
  "codeNotAvailable": boolean,
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
