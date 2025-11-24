import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSubmissionFeedback } from '@/services/feedback'
import {
  FeedbackHeader,
  OverallAnalysis,
  DesignComparison,
  TechAnalysis,
  Recommendations,
  FeedbackLoading,
  FeedbackProcessing,
  FeedbackError,
} from '@/services/feedback'
import type { TechCategory } from '@/services/feedback/components/TechAnalysis'

export const Route = createFileRoute('/feedback/$submissionId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { submissionId } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useSubmissionFeedback(submissionId)

  // Loading state
  if (isLoading) {
    return <FeedbackLoading />
  }

  // Error state
  if (error || !data) {
    return (
      <FeedbackError
        message={error?.message || 'Unable to load feedback'}
        onRetry={() => refetch()}
      />
    )
  }

  // Processing state
  if (data.status === 'pending' || data.status === 'processing') {
    return <FeedbackProcessing />
  }

  // No feedback yet
  if (!data.feedback) {
    return (
      <FeedbackError
        message='Feedback is being generated. Please check back soon.'
        onRetry={() => refetch()}
      />
    )
  }

  // Parse feedback data
  const feedback = data.feedback
  const submission = data.submission
  const challenge = data.challenge

  // Parse comments JSON (expected structure from AI)
  let analysisData: {
    whatYouDidWell: string[]
    areasForImprovement: string[]
    techAnalysis: TechCategory[]
  } = {
    whatYouDidWell: [],
    areasForImprovement: [],
    techAnalysis: [],
  }

  try {
    const parsedComments = JSON.parse(feedback.comments || '{}')
    analysisData = {
      whatYouDidWell: parsedComments.whatYouDidWell || [],
      areasForImprovement: parsedComments.areasForImprovement || [],
      techAnalysis: parsedComments.techAnalysis || [],
    }
  } catch (err) {
    console.error('[FeedbackPage] Error parsing comments:', err)
  }

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

  const learningResources = feedback.suggestions.map(
    (suggestion: string, idx: number) => ({
      title: `Resource ${idx + 1}`,
      description: suggestion,
      link: '#',
    })
  )

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
        <OverallAnalysis
          whatYouDidWell={analysisData.whatYouDidWell}
          areasForImprovement={analysisData.areasForImprovement}
        />

        <DesignComparison
          originalDesignImage={challenge.preview_image || undefined}
          userResultImage={
            submission.screenshots?.[0] || undefined
          }
        />

        <TechAnalysis categories={analysisData.techAnalysis} />

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
