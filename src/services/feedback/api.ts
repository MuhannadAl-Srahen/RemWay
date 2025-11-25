import { supabase } from '@/lib/supabaseClient'
import type {
  FeedbackResponse,
  FeedbackStatus,
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

    // Fetch feedback if it exists
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('challenge_feedback')
      .select('*')
      .eq('submission_id', submissionId)
      .maybeSingle()

    if (feedbackError) {
      console.error('[getSubmissionFeedback] feedback error:', feedbackError)
    }

    // Type assertion for submission data with relations
    const submission = submissionData as any

    // Type assertion for feedback data
    const feedback = feedbackData as any

    // Check if feedback is STALE (created before submission was updated)
    // This happens when user resubmits - we need to regenerate feedback
    let feedbackIsStale = false
    if (feedbackData && submission.submitted_at && feedback.created_at) {
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
    if (feedbackData && !feedbackIsStale) {
      status = 'completed'
    } else if (feedbackIsStale) {
      // Feedback exists but is stale - treat as pending for regeneration
      status = 'pending'
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

    return {
      submission: submissionFormatted,
      feedback: feedbackData
        ? {
            id: feedback.id,
            submission_id: feedback.submission_id,
            overall_score: feedback.overall_score,
            overall_rating: feedback.overall_rating,
            overall_good_practices: feedback.overall_good_practices || [],
            improvment_advices: feedback.improvment_advices || [],
            best_practices: feedback.best_practices || [],
            code_formatting: feedback.code_formatting || [],
            functionality: feedback.functionality || [],
            accessibility: feedback.accessibility || [],
            recommended_resources: feedback.recommended_resources,
            recommended_next_challenge: feedback.recommended_next_challenge,
            comparison_notes: feedback.comparison_notes,
            submission_mismatch: feedback.submission_mismatch || null,
            previous_feedback_summary:
              feedback.previous_feedback_summary || null,
            improvements_from_previous:
              feedback.improvements_from_previous || null,
            ai_model_version: feedback.ai_model_version,
            created_at: feedback.created_at,
          }
        : null,
      status,
      challenge: {
        id: submission.challenges?.id || '',
        title: submission.challenges?.title || 'Unknown Challenge',
        difficulty: submission.challenges?.difficulty || 'medium',
        thumbnail_url: submission.challenges?.thumbnail_url || null,
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
    // 0. First, fetch any existing feedback for this submission (for comparison on resubmission)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingFeedback } = await (
      supabase.from('challenge_feedback') as any
    )
      .select('*')
      .eq('submission_id', submissionId)
      .maybeSingle()

    let previousFeedbackSummary = null
    if (existingFeedback) {
      // Store the previous feedback for comparison
      previousFeedbackSummary = {
        previous_score: existingFeedback.overall_score,
        issues_to_fix: existingFeedback.improvment_advices || [],
        previous_best_practices: existingFeedback.best_practices || [],
        previous_code_formatting: existingFeedback.code_formatting || [],
        previous_functionality: existingFeedback.functionality || [],
        previous_accessibility: existingFeedback.accessibility || [],
      }
      console.log(
        '[generateAndStoreFeedback] 📋 Found previous feedback for comparison:',
        previousFeedbackSummary
      )

      // Delete the old feedback so we can insert new one
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('challenge_feedback') as any)
        .delete()
        .eq('submission_id', submissionId)
      console.log(
        '[generateAndStoreFeedback] 🗑️ Deleted old feedback for regeneration'
      )
    }

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

    const anySubmission = submission as any
    console.log('[generateAndStoreFeedback] 🔍 Checking challenge data:', {
      hasChallenge: !!anySubmission.challenges,
      challengeType: typeof anySubmission.challenges,
      challengeKeys: anySubmission.challenges
        ? Object.keys(anySubmission.challenges)
        : 'N/A',
    })

    const submissionData =
      submission as unknown as ChallengeSubmissionWithChallenge

    // Handle Supabase returning 'challenges' as array or object
    if (!submissionData.challenge) {
      console.warn(
        '[generateAndStoreFeedback] ⚠️ No .challenge property, checking .challenges...'
      )
      const challengesData = (submission as any).challenges

      if (Array.isArray(challengesData) && challengesData.length > 0) {
        console.log(
          '[generateAndStoreFeedback] ✅ Found challenges array, using first element'
        )
        submissionData.challenge = challengesData[0]
      } else if (challengesData && typeof challengesData === 'object') {
        console.log(
          '[generateAndStoreFeedback] ✅ Found challenges object, using directly'
        )
        submissionData.challenge = challengesData
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await supabase
        .from('challenge_feedback')
        .insert(feedbackData as any)

      if (insertError) {
        console.error(
          '[generateAndStoreFeedback] Failed to store validation error feedback:',
          insertError
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requirements = (overview as any)?.requirements || []

    // 2. Check for previous submission
    const previousSubmission = await getPreviousSubmission(
      submissionData.challenge_id,
      submissionData.profile_id,
      submissionId
    )

    // 3. Generate AI feedback
    const startTime = Date.now()
    const aiFeedback = await generateAIFeedback({
      submission: submissionData,
      previousSubmission: previousSubmission || undefined,
      previousFeedback: previousFeedbackSummary || undefined, // Include previous feedback for comparison
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
      // Store previous feedback summary for reference
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
      ai_model_version: 'gemini-2.5-flash',
      feedback_generation_time: generationTime,
      // These are foreign keys to challenge_submissions - use actual URLs
      live_preview: submissionData.live_site_url || submissionData.github_url,
      view_code: submissionData.github_url,
    }

    const { error: insertError } = await supabase
      .from('challenge_feedback')
      .insert(feedbackData as any)

    if (insertError) {
      console.error('[generateAndStoreFeedback] insert error:', insertError)
      return { success: false, error: 'Failed to store feedback' }
    }

    // 5. Update submission with previous_submission_id link if applicable
    if (previousSubmission) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query = supabase.from('challenge_submissions') as any
      await query
        .update({ previous_submission_id: previousSubmission.id })
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
