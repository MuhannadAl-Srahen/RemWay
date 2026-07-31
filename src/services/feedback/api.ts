import { supabase } from '@/lib/supabaseClient'
import type {
  FeedbackResponse,
  FeedbackStatus,
  FeedbackAnalysisEntry,
  ChallengeSubmissionWithChallenge,
} from '@/types/feedback'
import type { ChallengeSubmission } from '@/types/challenge'
import { generateAIFeedback } from '@/services/ai'
import {
  validateSubmission,
  generateValidationErrorFeedback,
} from '@/services/ai/validation'

export interface SubmissionWithFeedback {
  submission: ChallengeSubmission
  feedback: FeedbackResponse | null
  status: FeedbackStatus
  challenge: {
    id: string
    title: string
    difficulty: string
    thumbnail_url: string | null
  }
}

/**
 * Row shapes this module reads back from Supabase.
 *
 * These exist because the generated Database type in src/types/supabase.ts is
 * out of sync with the live schema: it declares 2 of the 8 tables the app
 * queries, and the columns it does declare for `challenge_submissions` omit
 * several this module reads (user_id, submission_url, score, status). Rather
 * than cast to `any` at every access, describe what the queries actually
 * return. Regenerating the Supabase types should replace all of this.
 *
 * ChallengeRelation is the embedded `challenges` relation, and matches the
 * `challenge` shape on ChallengeSubmissionWithChallenge that it is assigned to.
 */
type ChallengeRelation = ChallengeSubmissionWithChallenge['challenge']

interface SubmissionRow {
  id: string
  user_id: string
  challenge_id: string
  submission_url: string
  github_url?: string
  live_site_url?: string
  description?: string
  screenshots?: string[]
  submitted_at: string
  score?: number
  status: ChallengeSubmission['status']
  /**
   * PostgREST embeds a relation as a bare object or a single-element array
   * depending on how it infers the foreign key, so both are possible here.
   * Normalise with `firstRelation` before reading fields off it.
   */
  challenges?: ChallengeRelation | ChallengeRelation[] | null
}

type FeedbackRow = FeedbackResponse

/**
 * Unwrap a PostgREST embedded relation that may arrive as an object or as a
 * single-element array.
 */
const firstRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

/**
 * Flatten a stored tech-analysis column to plain strings for the AI prompt,
 * which joins them into text. Current rows already hold formatted strings;
 * legacy rows hold TechAnalysisItem objects, which would otherwise reach the
 * prompt as "[object Object]".
 */
const toAnalysisStrings = (
  entries: FeedbackAnalysisEntry[] | null | undefined
): string[] =>
  (entries || []).map((entry) =>
    typeof entry === 'string'
      ? entry
      : `${entry.category}: ${entry.description} (${entry.status})`
  )

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
          thumbnail_url
        )
      `
      )
      .eq('id', submissionId)
      .single()

    if (submissionError) {
      console.error(
        '[getSubmissionFeedback] submission error:',
        submissionError
      )
      return null
    }

    if (!submissionData) {
      console.warn('[getSubmissionFeedback] no submission found:', submissionId)
      return null
    }

    // Fetch feedback if it exists - get the most recent one in case of duplicates
    // Using .order() and .limit(1) instead of .maybeSingle() to handle multiple rows gracefully
    const { data: feedbackResults, error: feedbackError } = await supabase
      .from('challenge_feedback')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false })
      .limit(1)

    // Get the first (most recent) feedback or null
    const feedbackData =
      feedbackResults && feedbackResults.length > 0 ? feedbackResults[0] : null

    if (feedbackError) {
      console.error('[getSubmissionFeedback] feedback error:', feedbackError)
    }

    // If there are multiple feedback records, clean up the old ones (keep only the most recent)
    if (feedbackResults && feedbackResults.length > 1) {
      console.warn(
        `[getSubmissionFeedback] Found ${feedbackResults.length} feedback records for submission ${submissionId}, cleaning up duplicates...`
      )
      // Note: Cleanup is done asynchronously, don't await
      const keepId = (feedbackData as FeedbackRow | null)?.id
      cleanupDuplicateFeedback(submissionId, keepId).catch((err: unknown) =>
        console.error(
          '[getSubmissionFeedback] Failed to cleanup duplicates:',
          err
        )
      )
    }

    // Narrow to the row shapes described above (see SubmissionRow)
    const submission = submissionData as unknown as SubmissionRow

    const feedback = feedbackData as unknown as FeedbackRow | null

    // Check if feedback is STALE (created before submission was updated)
    // This happens when user resubmits - we need to regenerate feedback
    let feedbackIsStale = false
    if (feedback && submission.submitted_at && feedback.created_at) {
      const submittedAt = new Date(submission.submitted_at)
      const feedbackCreatedAt = new Date(feedback.created_at)
      feedbackIsStale = feedbackCreatedAt < submittedAt

      if (feedbackIsStale) {
        console.log(
          '[getSubmissionFeedback] ⚠️ Feedback is STALE - was created before submission update'
        )
        console.log(
          '[getSubmissionFeedback] Submission updated:',
          submittedAt.toISOString()
        )
        console.log(
          '[getSubmissionFeedback] Feedback created:',
          feedbackCreatedAt.toISOString()
        )
      }
    }

    // Determine status based on feedback existence AND staleness
    let status: FeedbackStatus = 'pending'
    let feedbackToReturn = feedbackData // The feedback to return to the client

    if (feedbackData && !feedbackIsStale) {
      status = 'completed'
    } else if (feedbackIsStale) {
      // Feedback exists but is stale - treat as pending for regeneration
      // IMPORTANT: Don't return stale feedback to the client
      status = 'pending'
      feedbackToReturn = null // Clear stale feedback so UI shows loading state
      console.log(
        '[getSubmissionFeedback] 🔄 Returning null feedback (stale) to trigger regeneration'
      )
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
      live_url: submission.live_site_url, // DB column is live_site_url
      description: submission.description,
      screenshots: submission.screenshots,
      submitted_at: submission.submitted_at,
      score: submission.score,
      status: submission.status,
    }

    // Use feedbackToReturn (which is null if stale) instead of feedbackData
    const feedbackToFormat = feedbackToReturn as unknown as FeedbackRow

    const challengeRelation = firstRelation(submission.challenges)

    return {
      submission: submissionFormatted,
      feedback: feedbackToReturn
        ? {
            id: feedbackToFormat.id,
            submission_id: feedbackToFormat.submission_id,
            overall_score: feedbackToFormat.overall_score,
            overall_rating: feedbackToFormat.overall_rating,
            overall_good_practices:
              feedbackToFormat.overall_good_practices || [],
            improvment_advices: feedbackToFormat.improvment_advices || [],
            best_practices: feedbackToFormat.best_practices || [],
            code_formatting: feedbackToFormat.code_formatting || [],
            functionality: feedbackToFormat.functionality || [],
            accessibility: feedbackToFormat.accessibility || [],
            recommended_resources: feedbackToFormat.recommended_resources,
            recommended_next_challenge:
              feedbackToFormat.recommended_next_challenge,
            comparison_notes: feedbackToFormat.comparison_notes,
            submission_mismatch: feedbackToFormat.submission_mismatch || null,
            previous_feedback_summary:
              feedbackToFormat.previous_feedback_summary || null,
            improvements_from_previous:
              feedbackToFormat.improvements_from_previous || null,
            ai_model_version: feedbackToFormat.ai_model_version,
            created_at: feedbackToFormat.created_at,
          }
        : null,
      status,
      challenge: {
        id: challengeRelation?.id || '',
        title: challengeRelation?.title || 'Unknown Challenge',
        difficulty: challengeRelation?.difficulty || 'medium',
        thumbnail_url: challengeRelation?.thumbnail_url || null,
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

/**
 * Get previous submission for the same challenge and user
 */
export const getPreviousSubmission = async (
  challengeId: string,
  profileId: string,
  currentSubmissionId: string
): Promise<ChallengeSubmissionWithChallenge | null> => {
  try {
    const { data, error } = await supabase
      .from('challenge_submissions')
      .select(
        `
        *,
        challenges (
          id,
          title,
          difficulty,
          description,
          thumbnail_url
        )
      `
      )
      .eq('challenge_id', challengeId)
      .eq('profile_id', profileId)
      .neq('id', currentSubmissionId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[getPreviousSubmission] error:', error)
      return null
    }

    if (!data) {
      return null
    }

    return data as unknown as ChallengeSubmissionWithChallenge
  } catch (err) {
    console.error('[getPreviousSubmission] unexpected error:', err)
    return null
  }
}

/**
 * Generate and store AI feedback for a submission
 */
export const generateAndStoreFeedback = async (
  submissionId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 0. Check if feedback already exists for this submission
    const { data: existingFeedbackRow } = await supabase
      .from('challenge_feedback')
      .select('*')
      .eq('submission_id', submissionId)
      .maybeSingle()
    const existingFeedback = existingFeedbackRow as FeedbackRow | null

    // 1. Fetch submission with challenge details and overview
    const { data: submission, error: submissionError } = await supabase
      .from('challenge_submissions')
      .select(
        `
        *,
        challenges (
          id,
          title,
          difficulty,
          description,
          thumbnail_url
        )
      `
      )
      .eq('id', submissionId)
      .single()

    console.log('[generateAndStoreFeedback] Query result:', {
      submission,
      submissionError,
    })

    // Check if feedback exists and is still valid (created AFTER submission was last updated)
    // If the user resubmits, submitted_at will be newer than feedback.created_at
    if (existingFeedback && submission) {
      const submissionData = submission as unknown as SubmissionRow
      const submittedAt = new Date(submissionData.submitted_at)
      const feedbackCreatedAt = new Date(existingFeedback.created_at)

      // Only skip regeneration if feedback is NEWER than submission
      // This means the code hasn't changed since feedback was generated
      if (feedbackCreatedAt >= submittedAt) {
        console.log(
          '[generateAndStoreFeedback] ✅ Feedback is up-to-date, skipping regeneration'
        )
        console.log(
          `[generateAndStoreFeedback] Submission: ${submittedAt.toISOString()}, Feedback: ${feedbackCreatedAt.toISOString()}`
        )
        return { success: true }
      } else {
        console.log(
          '[generateAndStoreFeedback] ⚠️ Submission was updated after feedback - regenerating'
        )
        console.log(
          `[generateAndStoreFeedback] Submission: ${submittedAt.toISOString()}, Feedback: ${feedbackCreatedAt.toISOString()}`
        )
        // Delete old feedback before regenerating
        await supabase
          .from('challenge_feedback')
          .delete()
          .eq('submission_id', submissionId)
        console.log('[generateAndStoreFeedback] 🗑️ Deleted stale feedback')
      }
    }

    if (submissionError) {
      console.error(
        '[generateAndStoreFeedback] Supabase error:',
        submissionError
      )
      return {
        success: false,
        error: `Database error: ${submissionError.message}`,
      }
    }

    if (!submission) {
      console.error(
        '[generateAndStoreFeedback] No submission found for ID:',
        submissionId
      )
      return { success: false, error: 'Submission not found' }
    }

    console.log(
      '[generateAndStoreFeedback] 📦 Raw submission data:',
      JSON.stringify(submission, null, 2)
    )

    const submissionRow = submission as unknown as SubmissionRow
    console.log('[generateAndStoreFeedback] 🔍 Checking challenge data:', {
      hasChallenge: !!submissionRow.challenges,
      challengeType: typeof submissionRow.challenges,
      challengeKeys: submissionRow.challenges
        ? Object.keys(submissionRow.challenges)
        : 'N/A',
    })

    const submissionData =
      submission as unknown as ChallengeSubmissionWithChallenge

    // Handle Supabase returning 'challenges' as array or object
    if (!submissionData.challenge) {
      console.warn(
        '[generateAndStoreFeedback] ⚠️ No .challenge property, checking .challenges...'
      )
      const challengesData = (submission as unknown as SubmissionRow).challenges
      const challengeRelation = firstRelation(challengesData)

      if (Array.isArray(challengesData) && challengesData.length > 0) {
        console.log(
          '[generateAndStoreFeedback] ✅ Found challenges array, using first element'
        )
        submissionData.challenge = challengesData[0]
      } else if (challengeRelation) {
        console.log(
          '[generateAndStoreFeedback] ✅ Found challenges object, using directly'
        )
        submissionData.challenge = challengeRelation
      } else {
        console.error(
          '[generateAndStoreFeedback] ❌ No valid challenge data found:',
          challengesData
        )
        return {
          success: false,
          error: 'Challenge data not found in submission',
        }
      }
    }

    console.log('[generateAndStoreFeedback] ✅ Final challenge data:', {
      id: submissionData.challenge.id,
      title: submissionData.challenge.title,
      difficulty: submissionData.challenge.difficulty,
    })

    // 1.5. Validate submission URLs before proceeding
    const validation = validateSubmission({
      github_url: submissionData.github_url,
      live_site_url: submissionData.live_site_url,
      challenge: submissionData.challenge,
    })

    if (!validation.isValid) {
      console.error(
        '[generateAndStoreFeedback] ❌ Validation failed:',
        validation.errors
      )

      // Generate error feedback for invalid submissions
      const errorFeedback = generateValidationErrorFeedback(
        validation.errors,
        validation.warnings
      )

      // Store the error feedback so user knows what went wrong
      const feedbackData = {
        submission_id: submissionId,
        overall_score: errorFeedback.overallScore,
        overall_rating: errorFeedback.overallRating,
        overall_good_practices: errorFeedback.whatYouDidWell,
        improvment_advices: errorFeedback.areasForImprovement,
        best_practices: errorFeedback.techAnalysis.bestPractices.map(
          (item) => `${item.category}: ${item.description} (${item.status})`
        ),
        code_formatting: [],
        functionality: [],
        accessibility: [],
        recommended_resources: errorFeedback.recommendations.learningResources,
        recommended_next_challenge: null,
        overall_analysis_description: {
          designNotes: errorFeedback.designComparison.designNotes,
          matchesDesign: false,
        },
        comparison_notes: null,
        submission_mismatch: {
          is_mismatched: true,
          expected_project: 'Valid GitHub Repository URL',
          actual_project: submissionData.github_url,
          explanation: validation.errors.join('. '),
        },
        ai_model_version: 'validation-error',
        feedback_generation_time: 0,
        live_preview: submissionData.live_site_url || submissionData.github_url,
        view_code: submissionData.github_url,
      }

      // The generated challenge_feedback Insert type omits columns this row
      // writes (overall_analysis_description, feedback_generation_time,
      // live_preview, view_code), so the payload cannot be checked against it
      // until the Supabase types are regenerated.
      const { error: upsertError } = await supabase
        .from('challenge_feedback')
        .upsert(feedbackData as never, { onConflict: 'submission_id' })

      if (upsertError) {
        console.error(
          '[generateAndStoreFeedback] Failed to store validation error feedback:',
          upsertError
        )
        return { success: false, error: validation.errors.join('. ') }
      }

      return { success: true } // Stored the error feedback successfully
    }

    // Log any warnings but continue
    if (validation.warnings.length > 0) {
      console.warn(
        '[generateAndStoreFeedback] ⚠️ Validation warnings:',
        validation.warnings
      )
    }

    // 1.6. Fetch challenge overview for requirements
    const { data: overview } = await supabase
      .from('challenge_overview')
      .select('requirements')
      .eq('challenge_id', submissionData.challenge_id)
      .maybeSingle()

    // `challenge_overview` is absent from the generated Database type
    const requirements =
      (overview as { requirements?: string[] } | null)?.requirements || []

    // 2. Check for previous submission (a DIFFERENT submission for the same challenge)
    const previousSubmission = await getPreviousSubmission(
      submissionData.challenge_id,
      submissionData.profile_id,
      submissionId
    )

    // 2.1 If there's a previous submission, get its feedback for comparison
    let previousFeedbackSummary = null
    if (previousSubmission) {
      const { data: prevFeedbackRow } = await supabase
        .from('challenge_feedback')
        .select('*')
        .eq('submission_id', previousSubmission.id)
        .maybeSingle()
      const prevFeedback = prevFeedbackRow as FeedbackRow | null

      if (prevFeedback) {
        previousFeedbackSummary = {
          previous_score: prevFeedback.overall_score,
          issues_to_fix: prevFeedback.improvment_advices || [],
          previous_best_practices: toAnalysisStrings(
            prevFeedback.best_practices
          ),
          previous_code_formatting: toAnalysisStrings(
            prevFeedback.code_formatting
          ),
          previous_functionality: toAnalysisStrings(prevFeedback.functionality),
          previous_accessibility: toAnalysisStrings(prevFeedback.accessibility),
        }
        console.log(
          '[generateAndStoreFeedback] 📋 Found previous submission feedback for comparison:',
          {
            previousSubmissionId: previousSubmission.id,
            previousScore: prevFeedback.overall_score,
          }
        )
      }
    }

    // 3. Generate AI feedback
    const startTime = Date.now()
    const aiFeedback = await generateAIFeedback({
      submission: submissionData,
      previousSubmission: previousSubmission || undefined,
      // Only pass previousFeedback if there's a DIFFERENT previous submission with feedback
      previousFeedback: previousFeedbackSummary || undefined,
      challengeDescription: submissionData.challenge.description,
      designRequirements: requirements,
      techRequirements: requirements,
    })
    const generationTime = Date.now() - startTime

    console.log('[generateAndStoreFeedback] ✅ AI feedback generated')
    console.log('[generateAndStoreFeedback] 📊 Response structure:', {
      hasScore: !!aiFeedback.overallScore,
      hasRating: !!aiFeedback.overallRating,
      hasWhatYouDidWell: !!aiFeedback.whatYouDidWell,
      hasAreasForImprovement: !!aiFeedback.areasForImprovement,
      hasTechAnalysis: !!aiFeedback.techAnalysis,
      techAnalysisKeys: aiFeedback.techAnalysis
        ? Object.keys(aiFeedback.techAnalysis)
        : 'N/A',
      hasRecommendations: !!aiFeedback.recommendations,
    })
    console.log(
      '[generateAndStoreFeedback] 🔍 Full AI response:',
      JSON.stringify(aiFeedback, null, 2)
    )

    // 4. Store feedback in database
    const feedbackData = {
      submission_id: submissionId,
      overall_score: aiFeedback.overallScore,
      overall_rating: aiFeedback.overallRating,
      overall_good_practices: aiFeedback.whatYouDidWell || [],
      improvment_advices: aiFeedback.areasForImprovement || [],
      best_practices: (aiFeedback.techAnalysis?.bestPractices || []).map(
        (item) => `${item.category}: ${item.description} (${item.status})`
      ),
      code_formatting: (aiFeedback.techAnalysis?.codeFormatting || []).map(
        (item) => `${item.category}: ${item.description} (${item.status})`
      ),
      functionality: (aiFeedback.techAnalysis?.functionality || []).map(
        (item) => `${item.category}: ${item.description} (${item.status})`
      ),
      accessibility: (aiFeedback.techAnalysis?.accessibility || []).map(
        (item) => `${item.category}: ${item.description} (${item.status})`
      ),
      recommended_resources: aiFeedback.recommendations.learningResources,
      recommended_next_challenge:
        aiFeedback.recommendations.nextChallenges[0]?.title || null,
      overall_analysis_description: {
        designNotes: aiFeedback.designComparison.designNotes,
        matchesDesign: aiFeedback.designComparison.matchesDesign,
      },
      comparison_notes: aiFeedback.comparisonNotes || null,
      // Store mismatch detection data
      submission_mismatch: aiFeedback.submissionMismatch
        ? {
            is_mismatched: aiFeedback.submissionMismatch.isMismatched,
            expected_project: aiFeedback.submissionMismatch.expectedProject,
            actual_project: aiFeedback.submissionMismatch.actualProject,
            explanation: aiFeedback.submissionMismatch.explanation,
          }
        : null,
      // Store previous feedback summary for reference (only if comparing to a different submission)
      previous_feedback_summary: previousFeedbackSummary || null,
      // Store improvements tracking from AI analysis
      improvements_from_previous: aiFeedback.improvementsFromPrevious
        ? {
            issues_fixed: aiFeedback.improvementsFromPrevious.issuesFixed,
            previous_score: aiFeedback.improvementsFromPrevious.previousScore,
            score_improvement:
              aiFeedback.improvementsFromPrevious.scoreImprovement,
            overall_assessment:
              aiFeedback.improvementsFromPrevious.overallAssessment,
          }
        : null,
      ai_model_version: 'gemini-2.5-pro',
      feedback_generation_time: generationTime,
      // These are foreign keys to challenge_submissions - use actual URLs
      live_preview: submissionData.live_site_url || submissionData.github_url,
      view_code: submissionData.github_url,
    }

    // Use upsert to handle unique constraint on submission_id
    // This replaces existing feedback if regenerated
    // See the note on the other challenge_feedback upsert above: the generated
    // Insert type is missing columns this row writes.
    const { error: upsertError } = await supabase
      .from('challenge_feedback')
      .upsert(feedbackData as never, { onConflict: 'submission_id' })

    if (upsertError) {
      console.error('[generateAndStoreFeedback] upsert error:', upsertError)
      return { success: false, error: 'Failed to store feedback' }
    }

    // 5. Update submission with previous_submission_id link if applicable
    if (previousSubmission) {
      await supabase
        .from('challenge_submissions')
        .update({ previous_submission_id: previousSubmission.id } as never)
        .eq('id', submissionId)
    }

    return { success: true }
  } catch (err) {
    console.error('[generateAndStoreFeedback] error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Trigger feedback generation for a submission (can be called after submission creation)
 */
export const triggerFeedbackGeneration = async (
  submissionId: string
): Promise<void> => {
  try {
    // Run generation in background (don't await)
    generateAndStoreFeedback(submissionId).then((result) => {
      if (!result.success) {
        console.error('[triggerFeedbackGeneration] failed:', result.error)
      }
    })
  } catch (err) {
    console.error('[triggerFeedbackGeneration] error:', err)
  }
}

/**
 * Clean up duplicate feedback records for a submission
 * Keeps only the most recent feedback (identified by keepId)
 */
const cleanupDuplicateFeedback = async (
  submissionId: string,
  keepId: string | undefined
): Promise<void> => {
  if (!keepId) return

  try {
    const { error } = await supabase
      .from('challenge_feedback')
      .delete()
      .eq('submission_id', submissionId)
      .neq('id', keepId)

    if (error) {
      console.error('[cleanupDuplicateFeedback] error:', error)
    } else {
      console.log(
        '[cleanupDuplicateFeedback] ✅ Cleaned up duplicate feedback records'
      )
    }
  } catch (err) {
    console.error('[cleanupDuplicateFeedback] unexpected error:', err)
  }
}
