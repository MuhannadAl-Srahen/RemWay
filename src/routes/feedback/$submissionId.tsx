import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  useSubmissionFeedback,
  triggerFeedbackGeneration,
} from '@/services/feedback'
import {
  FeedbackHeader,
  OverallAnalysis,
  DesignComparison,
  TechAnalysis,
  Recommendations,
  FeedbackLoading,
  FeedbackProcessing,
  FeedbackError,
  MismatchWarning,
  CodeNotAvailableWarning,
  LiveUrlWarning,
  ImprovementsFromPrevious,
} from '@/services/feedback'
import { useChallenges } from '@/services/challenges'
import type { TechCategory } from '@/services/feedback/components/TechAnalysis'
import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'

export const Route = createFileRoute('/feedback/$submissionId')({
  component: RouteComponent,
})

// Animation variants for staggered content
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
}

function RouteComponent() {
  const { submissionId } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } =
    useSubmissionFeedback(submissionId)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generationTimedOut, setGenerationTimedOut] = useState(false)

  // Fetch real challenges from database (must be called before any conditional returns)
  const { data: allChallenges = [] } = useChallenges()

  // Find recommended next challenge from real challenges
  // This useMemo must be called before any early returns to follow Rules of Hooks
  const nextChallenges = useMemo(() => {
    // Return empty if we don't have the required data yet
    if (!data?.feedback || !data?.challenge || allChallenges.length === 0) {
      return []
    }

    const feedback = data.feedback
    const challenge = data.challenge

    // Get the AI's recommended challenge title (if any)
    const recommendedTitle = feedback.recommended_next_challenge

    // Current challenge difficulty for fallback logic
    const currentDifficulty = challenge.difficulty?.toLowerCase() || 'beginner'

    // Map difficulty to component format
    const mapDifficulty = (d: string): 'easy' | 'medium' | 'hard' => {
      const lower = d.toLowerCase()
      if (lower === 'beginner' || lower === 'easy') return 'easy'
      if (lower === 'intermediate' || lower === 'medium') return 'medium'
      return 'hard'
    }

    // Filter out the current challenge
    const otherChallenges = allChallenges.filter((c) => c.id !== challenge.id)

    if (otherChallenges.length === 0) return []

    // Try to find the AI-recommended challenge by title (fuzzy match)
    let recommended = recommendedTitle
      ? otherChallenges.find(
          (c) =>
            c.title.toLowerCase().includes(recommendedTitle.toLowerCase()) ||
            recommendedTitle.toLowerCase().includes(c.title.toLowerCase())
        )
      : null

    // Fallback: find a challenge of same or next difficulty level
    if (!recommended) {
      const difficultyOrder = [
        'beginner',
        'easy',
        'intermediate',
        'medium',
        'advanced',
        'hard',
      ]
      const currentIdx = difficultyOrder.findIndex(
        (d) => d === currentDifficulty
      )

      // Prefer same difficulty, then next level up
      recommended = otherChallenges.find(
        (c) => c.difficulty?.toLowerCase() === currentDifficulty
      )

      if (!recommended && currentIdx < difficultyOrder.length - 1) {
        const nextDifficulty = difficultyOrder[currentIdx + 1]
        recommended = otherChallenges.find(
          (c) => c.difficulty?.toLowerCase() === nextDifficulty
        )
      }

      // Final fallback: just pick the first available challenge
      if (!recommended) {
        recommended = otherChallenges[0]
      }
    }

    if (!recommended) return []

    return [
      {
        id: recommended.id,
        title: recommended.title,
        difficulty: mapDifficulty(recommended.difficulty || 'easy'),
        technologies: recommended.tags || [],
        description:
          recommended.description ||
          'Practice your frontend skills with this challenge',
      },
    ]
  }, [allChallenges, data?.feedback, data?.challenge])

  // Reset state when submissionId changes (for resubmissions)
  useEffect(() => {
    setHasTriggered(false)
    setIsGenerating(false)
    setGenerationError(null)
    setGenerationTimedOut(false)
  }, [submissionId])

  // Auto-trigger feedback generation if status is pending and not yet triggered
  useEffect(() => {
    if (
      data &&
      (data.status === 'pending' || !data.feedback) &&
      !hasTriggered &&
      !isGenerating &&
      !generationTimedOut
    ) {
      setHasTriggered(true)
      setIsGenerating(true)
      setGenerationError(null)

      triggerFeedbackGeneration(submissionId)
        .then(() => {
          // Poll for updates
          const pollInterval = setInterval(() => {
            refetch().then((result: unknown) => {
              const queryResult = result as { data?: typeof data }
              if (
                queryResult.data?.feedback ||
                queryResult.data?.status === 'completed'
              ) {
                clearInterval(pollInterval)
                setIsGenerating(false)
              }
            })
          }, 3000) // Check every 3 seconds

          // Stop polling after 2 minutes and show timeout message
          setTimeout(() => {
            clearInterval(pollInterval)
            setIsGenerating(false)
            // Check one more time if feedback exists
            refetch().then((result: unknown) => {
              const queryResult = result as { data?: typeof data }
              if (!queryResult.data?.feedback) {
                setGenerationTimedOut(true)
                setGenerationError(
                  'Feedback generation is taking longer than expected. Please try refreshing the page.'
                )
              }
            })
          }, 120000)
        })
        .catch((err) => {
          setIsGenerating(false)
          setGenerationError(
            err instanceof Error ? err.message : 'Failed to generate feedback'
          )
        })
    }
  }, [
    data,
    submissionId,
    hasTriggered,
    isGenerating,
    refetch,
    generationTimedOut,
  ])

  // Loading state
  if (isLoading) {
    return <FeedbackLoading />
  }

  // Error state (from query or generation)
  if (error || !data) {
    return (
      <FeedbackError
        message={error?.message || 'Unable to load feedback'}
        onRetry={() => refetch()}
      />
    )
  }

  // Generation error or timeout
  if (generationError) {
    return (
      <FeedbackError
        message={generationError}
        onRetry={() => {
          setGenerationError(null)
          setGenerationTimedOut(false)
          setHasTriggered(false)
          setIsGenerating(false)
          refetch()
        }}
      />
    )
  }

  // Processing/generating state
  if (isGenerating || data.status === 'processing') {
    return (
      <FeedbackProcessing
        challengeTitle={data.challenge?.title}
        githubUrl={data.submission?.github_url}
        liveUrl={data.submission?.live_url}
      />
    )
  }

  // No feedback yet - show manual trigger option
  if (!data.feedback) {
    const handleGenerateFeedback = async () => {
      setIsGenerating(true)
      setHasTriggered(true)
      setGenerationError(null)
      await triggerFeedbackGeneration(submissionId)

      // Poll for updates
      const pollInterval = setInterval(() => {
        refetch().then((result: unknown) => {
          const queryResult = result as { data?: typeof data }
          if (
            queryResult.data?.feedback ||
            queryResult.data?.status === 'completed'
          ) {
            clearInterval(pollInterval)
            setIsGenerating(false)
          }
        })
      }, 3000)

      setTimeout(() => {
        clearInterval(pollInterval)
        setIsGenerating(false)
      }, 120000)
    }

    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20'>
        <div className='text-center space-y-6'>
          <h2 className='text-2xl font-bold'>Generate AI Feedback</h2>
          <p className='text-muted-foreground max-w-md mx-auto'>
            Your submission is ready for AI analysis. Click the button below to
            generate detailed feedback.
          </p>
          <Button
            onClick={handleGenerateFeedback}
            size='lg'
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Feedback Now'}
          </Button>
        </div>
      </div>
    )
  }

  // Parse feedback data
  const feedback = data.feedback
  const submission = data.submission
  const challenge = data.challenge

  // Helper to parse feedback items from database format
  const parseFeedbackItems = (
    items: unknown[]
  ): { message: string; status: 'correct' | 'incorrect' | 'warning' }[] => {
    return (items || []).map((item: unknown) => {
      if (
        typeof item === 'object' &&
        item !== null &&
        'category' in item &&
        'description' in item &&
        'status' in item
      ) {
        const typedItem = item as {
          category: string
          description: string
          status: string
        }
        return {
          message: `${typedItem.category}: ${typedItem.description}`,
          status:
            typedItem.status === 'good'
              ? ('correct' as const)
              : typedItem.status === 'error'
                ? ('incorrect' as const)
                : ('warning' as const),
        }
      }

      // Parse string format: "Category: Description (status)"
      const text = String(item)
      const match = text.match(/^(.+?)\s*\((\w+)\)\s*$/)

      if (match) {
        const [, message, status] = match
        return {
          message: message.trim(),
          status:
            status === 'good'
              ? ('correct' as const)
              : status === 'error'
                ? ('incorrect' as const)
                : ('warning' as const),
        }
      }

      // Fallback: treat as message with 'correct' status
      return {
        message: text,
        status: 'correct' as const,
      }
    })
  }

  // Build tech analysis from database columns
  const techAnalysis: TechCategory[] = [
    {
      title: 'Best Practices',
      description: 'Code quality and development standards',
      items: parseFeedbackItems(feedback.best_practices),
    },
    {
      title: 'Code Formatting',
      description: 'Code style and organization',
      items: parseFeedbackItems(feedback.code_formatting),
    },
    {
      title: 'Functionality',
      description: 'Features and implementation',
      items: parseFeedbackItems(feedback.functionality),
    },
    {
      title: 'Accessibility',
      description: 'Inclusive design and usability',
      items: parseFeedbackItems(feedback.accessibility),
    },
  ]

  const submittedDate = new Date(submission.submitted_at).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  const learningResources = (feedback.recommended_resources || []).map(
    (resource: unknown) => {
      const r = resource as {
        title?: string
        description?: string
        url?: string
      }
      return {
        title: r.title || 'Learning Resource',
        description: r.description || '',
        link: r.url || '#',
      }
    }
  )

  // Check for submission mismatch
  const hasMismatch = feedback.submission_mismatch?.is_mismatched === true

  // Check if code wasn't available (score capped due to fetch failure)
  // This is indicated by a low score (<=40) combined with feedback mentioning code not available
  const codeNotAvailable =
    feedback.overall_score <= 40 &&
    (feedback.improvment_advices?.some(
      (advice: string) =>
        advice.toLowerCase().includes('source code could not be fetched') ||
        advice.toLowerCase().includes('no source code files') ||
        advice.toLowerCase().includes('repository is public')
    ) ||
      feedback.best_practices?.some(
        (item: unknown) =>
          typeof item === 'string' &&
          item.toLowerCase().includes('code not available')
      ))

  // Check if live URL had issues
  const liveUrlNotAccessible =
    submission.live_url &&
    feedback.improvment_advices?.some(
      (advice: string) =>
        advice.toLowerCase().includes('live site url') ||
        advice.toLowerCase().includes('live url could not') ||
        advice.toLowerCase().includes('deployment is working')
    )

  // Check for improvements from previous submission
  const hasImprovements =
    feedback.improvements_from_previous &&
    feedback.improvements_from_previous.issues_fixed &&
    feedback.improvements_from_previous.issues_fixed.length > 0

  return (
    <motion.div
      className='min-h-screen bg-background pt-20 pb-20'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className='py-8'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <FeedbackHeader
          challengeTitle={challenge.title}
          challengeId={challenge.id}
          submittedDate={submittedDate}
          liveUrl={submission.live_url || undefined}
          githubUrl={submission.github_url || undefined}
          overallScore={feedback.overall_score}
        />
      </motion.div>

      <motion.div
        className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* Show mismatch warning if wrong project was submitted */}
        <AnimatePresence>
          {hasMismatch && feedback.submission_mismatch && (
            <motion.div variants={itemVariants}>
              <MismatchWarning
                expectedProject={feedback.submission_mismatch.expected_project}
                actualProject={feedback.submission_mismatch.actual_project}
                explanation={feedback.submission_mismatch.explanation}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show code not available warning if score was capped due to fetch failure */}
        <AnimatePresence>
          {codeNotAvailable && !hasMismatch && submission.github_url && (
            <motion.div variants={itemVariants}>
              <CodeNotAvailableWarning githubUrl={submission.github_url} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show live URL warning if the live site couldn't be accessed */}
        <AnimatePresence>
          {liveUrlNotAccessible && !hasMismatch && submission.live_url && (
            <motion.div variants={itemVariants}>
              <LiveUrlWarning liveUrl={submission.live_url} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show improvements from previous submission if this is a resubmission */}
        <AnimatePresence>
          {hasImprovements && feedback.improvements_from_previous && (
            <motion.div variants={itemVariants}>
              <ImprovementsFromPrevious
                issuesFixed={feedback.improvements_from_previous.issues_fixed.map(
                  (item: {
                    issue: string
                    was_fixed?: boolean
                    wasFixed?: boolean
                    details: string
                  }) => ({
                    issue: item.issue,
                    was_fixed: item.was_fixed ?? item.wasFixed ?? false,
                    details: item.details,
                  })
                )}
                previousScore={
                  feedback.improvements_from_previous.previous_score
                }
                currentScore={feedback.overall_score}
                overallAssessment={
                  feedback.improvements_from_previous.overall_assessment
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants}>
          <OverallAnalysis
            whatYouDidWell={feedback.overall_good_practices}
            areasForImprovement={feedback.improvment_advices}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <DesignComparison
            originalDesignImage={challenge.thumbnail_url || undefined}
            userResultImage={submission.screenshots?.[0] || undefined}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TechAnalysis categories={techAnalysis} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Recommendations
            nextChallenges={nextChallenges}
            learningResources={learningResources}
            onStartChallenge={(id) =>
              navigate({ to: '/challenges/$id', params: { id } })
            }
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
