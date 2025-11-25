import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSubmissionFeedback, triggerFeedbackGeneration } from '@/services/feedback'
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
  ImprovementsFromPrevious,
} from '@/services/feedback'
import type { TechCategory } from '@/services/feedback/components/TechAnalysis'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/feedback/$submissionId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { submissionId } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useSubmissionFeedback(submissionId)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generationTimedOut, setGenerationTimedOut] = useState(false)

  // Reset state when submissionId changes (for resubmissions)
  useEffect(() => {
    setHasTriggered(false)
    setIsGenerating(false)
    setGenerationError(null)
    setGenerationTimedOut(false)
  }, [submissionId])

  // Auto-trigger feedback generation if status is pending and not yet triggered
  useEffect(() => {
    if (data && (data.status === 'pending' || !data.feedback) && !hasTriggered && !isGenerating && !generationTimedOut) {
      setHasTriggered(true)
      setIsGenerating(true)
      setGenerationError(null)
      
      triggerFeedbackGeneration(submissionId).then(() => {
        // Poll for updates
        const pollInterval = setInterval(() => {
          refetch().then((result: unknown) => {
            const queryResult = result as { data?: typeof data }
            if (queryResult.data?.feedback || queryResult.data?.status === 'completed') {
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
              setGenerationError('Feedback generation is taking longer than expected. Please try refreshing the page.')
            }
          })
        }, 120000)
      }).catch((err) => {
        setIsGenerating(false)
        setGenerationError(err instanceof Error ? err.message : 'Failed to generate feedback')
      })
    }
  }, [data, submissionId, hasTriggered, isGenerating, refetch, generationTimedOut])

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
          if (queryResult.data?.feedback || queryResult.data?.status === 'completed') {
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
            Your submission is ready for AI analysis. Click the button below to generate detailed feedback.
          </p>
          <Button onClick={handleGenerateFeedback} size='lg' disabled={isGenerating}>
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
  const parseFeedbackItems = (items: unknown[]): { message: string; status: 'correct' | 'incorrect' | 'warning' }[] => {
    return (items || []).map((item: unknown) => {
      if (typeof item === 'object' && item !== null && 'category' in item && 'description' in item && 'status' in item) {
        const typedItem = item as { category: string; description: string; status: string }
        return {
          message: `${typedItem.category}: ${typedItem.description}`,
          status: typedItem.status === 'good' ? 'correct' as const : typedItem.status === 'error' ? 'incorrect' as const : 'warning' as const,
        }
      }
      
      // Parse string format: "Category: Description (status)"
      const text = String(item)
      const match = text.match(/^(.+?)\s*\((\w+)\)\s*$/)
      
      if (match) {
        const [, message, status] = match
        return {
          message: message.trim(),
          status: status === 'good' ? 'correct' as const : status === 'error' ? 'incorrect' as const : 'warning' as const,
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

  const nextChallenge = {
    id: 'next-challenge-id',
    title: 'Blog Preview Card',
    difficulty: 'easy' as const,
    technologies: ['HTML', 'CSS', 'Flexbox'],
    description: 'Build a responsive blog preview card component',
  }

  const nextChallenges = [nextChallenge]

  const learningResources = (feedback.recommended_resources || []).map(
    (resource: unknown) => {
      const r = resource as { title?: string; description?: string; url?: string }
      return {
        title: r.title || 'Learning Resource',
        description: r.description || '',
        link: r.url || '#',
      }
    }
  )

  // Check for submission mismatch
  const hasMismatch = feedback.submission_mismatch?.is_mismatched === true

  // Check for improvements from previous submission
  const hasImprovements = feedback.improvements_from_previous && 
    feedback.improvements_from_previous.issues_fixed && 
    feedback.improvements_from_previous.issues_fixed.length > 0

  return (
    <div className='min-h-screen bg-background pt-20 pb-20'>
      <div className='py-8'>
        <FeedbackHeader
          challengeTitle={challenge.title}
          challengeId={challenge.id}
          submittedDate={submittedDate}
          liveUrl={submission.live_url || undefined}
          githubUrl={submission.github_url || undefined}
          overallScore={feedback.overall_score}
        />
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6'>
        {/* Show mismatch warning if wrong project was submitted */}
        {hasMismatch && feedback.submission_mismatch && (
          <MismatchWarning
            expectedProject={feedback.submission_mismatch.expected_project}
            actualProject={feedback.submission_mismatch.actual_project}
            explanation={feedback.submission_mismatch.explanation}
          />
        )}

        {/* Show improvements from previous submission if this is a resubmission */}
        {hasImprovements && feedback.improvements_from_previous && (
          <ImprovementsFromPrevious
            issuesFixed={feedback.improvements_from_previous.issues_fixed.map((item: { issue: string; was_fixed?: boolean; wasFixed?: boolean; details: string }) => ({
              issue: item.issue,
              was_fixed: item.was_fixed ?? item.wasFixed ?? false,
              details: item.details,
            }))}
            previousScore={feedback.improvements_from_previous.previous_score}
            currentScore={feedback.overall_score}
            overallAssessment={feedback.improvements_from_previous.overall_assessment}
          />
        )}

        <OverallAnalysis
          whatYouDidWell={feedback.overall_good_practices}
          areasForImprovement={feedback.improvment_advices}
        />

        <DesignComparison
          originalDesignImage={challenge.thumbnail_url || undefined}
          userResultImage={
            submission.screenshots?.[0] || undefined
          }
        />

        <TechAnalysis categories={techAnalysis} />

        <Recommendations
          nextChallenges={nextChallenges}
          learningResources={learningResources}
          onStartChallenge={(id) =>
            navigate({ to: '/challenges/$id', params: { id } })
          }
        />
      </div>
    </div>
  )
}
