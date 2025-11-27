import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  Clock,
  AlertCircle,
  Check,
  Code,
  Globe,
  Sparkles,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function FeedbackLoading() {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20'>
      <Card className='bg-card border shadow-sm'>
        <CardContent className='flex flex-col items-center justify-center py-20'>
          <Loader2 className='h-12 w-12 text-primary animate-spin mb-4' />
          <h2 className='text-xl font-semibold text-foreground mb-2'>
            Loading Feedback
          </h2>
          <p className='text-sm text-muted-foreground text-center max-w-md'>
            Retrieving your submission details and AI-generated feedback...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

interface ProcessingStep {
  id: string
  label: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'completed' | 'error'
  detail?: string
}

interface FeedbackProcessingProps {
  challengeTitle?: string
  githubUrl?: string
  liveUrl?: string
}

export function FeedbackProcessing({
  challengeTitle,
  githubUrl,
  liveUrl,
}: FeedbackProcessingProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'fetch',
      label: 'Fetching code from GitHub',
      icon: <Code className='h-4 w-4' />,
      status: 'active',
      detail: githubUrl,
    },
    {
      id: 'analyze',
      label: 'Analyzing code quality',
      icon: <FileText className='h-4 w-4' />,
      status: 'pending',
    },
    {
      id: 'design',
      label: 'Checking live site',
      icon: <Globe className='h-4 w-4' />,
      status: 'pending',
      detail: liveUrl,
    },
    {
      id: 'generate',
      label: 'Generating AI feedback',
      icon: <Sparkles className='h-4 w-4' />,
      status: 'pending',
    },
  ])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentTip, setCurrentTip] = useState(0)

  const tips = [
    '💡 The AI is reading your actual source code for accurate feedback.',
    '🔍 We analyze code structure, naming conventions, and best practices.',
    '📱 Responsive design and accessibility are checked automatically.',
    '⚡ Your code is compared against industry standards.',
    '🎯 Personalized recommendations are generated based on your work.',
  ]

  // Simulate step progression based on elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Update steps based on elapsed time
  useEffect(() => {
    setSteps((prev) =>
      prev.map((step, index) => {
        if (index === 0 && elapsedTime >= 2)
          return { ...step, status: 'completed' }
        if (index === 1 && elapsedTime >= 5)
          return { ...step, status: 'completed' }
        if (index === 1 && elapsedTime >= 2)
          return { ...step, status: 'active' }
        if (index === 2 && elapsedTime >= 10)
          return { ...step, status: 'completed' }
        if (index === 2 && elapsedTime >= 5)
          return { ...step, status: 'active' }
        if (index === 3 && elapsedTime >= 10)
          return { ...step, status: 'active' }
        return step
      })
    )
  }, [elapsedTime])

  // Rotate tips
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 4000)

    return () => clearInterval(tipTimer)
  }, [tips.length])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20'>
      <Card className='bg-card border shadow-sm overflow-hidden'>
        {/* Progress bar */}
        <div className='h-1 bg-muted'>
          <div
            className='h-full bg-primary transition-all duration-1000 ease-out'
            style={{ width: `${Math.min((elapsedTime / 25) * 100, 95)}%` }}
          />
        </div>

        <CardContent className='flex flex-col items-center justify-center py-12 px-6'>
          {/* Animated icon */}
          <div className='relative mb-6'>
            <div className='absolute inset-0 bg-primary/20 rounded-full animate-ping' />
            <div className='relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
              <Clock className='h-8 w-8 text-primary animate-pulse' />
            </div>
          </div>

          <h2 className='text-2xl font-bold text-foreground mb-2'>
            Analyzing Your Submission
          </h2>

          {challengeTitle && (
            <p className='text-primary font-medium mb-4'>{challengeTitle}</p>
          )}

          <p className='text-sm text-muted-foreground text-center max-w-md mb-2'>
            Our AI is carefully reviewing your code and design. This typically
            takes 30 - 60 seconds.
          </p>

          <p className='text-xs text-muted-foreground mb-8'>
            Elapsed: {formatTime(elapsedTime)}
          </p>

          {/* Progress Steps */}
          <div className='w-full max-w-lg space-y-4 mb-8'>
            {steps.map((step) => (
              <div key={step.id} className='flex items-start gap-4'>
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    step.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : step.status === 'active'
                        ? 'bg-primary text-white animate-pulse'
                        : step.status === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <p
                    className={`text-sm font-medium ${
                      step.status === 'completed'
                        ? 'text-green-600 dark:text-green-400'
                        : step.status === 'active'
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {step.status === 'completed'
                      ? '✓ '
                      : step.status === 'active'
                        ? '⏳ '
                        : ''}
                    {step.label}
                  </p>
                  {step.detail && step.status !== 'pending' && (
                    <p className='text-xs text-muted-foreground truncate mt-0.5'>
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Rotating tips */}
          <div className='bg-muted/50 rounded-lg px-6 py-4 max-w-md transition-all duration-500'>
            <p className='text-sm text-muted-foreground text-center'>
              {tips[currentTip]}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface FeedbackErrorProps {
  message?: string
  onRetry?: () => void
}

export function FeedbackError({
  message = 'Unable to load feedback. Please try again.',
  onRetry,
}: FeedbackErrorProps) {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20'>
      <Card className='bg-card border shadow-sm'>
        <CardContent className='flex flex-col items-center justify-center py-20'>
          <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
          <h2 className='text-xl font-semibold text-foreground mb-2'>
            Error Loading Feedback
          </h2>
          <p className='text-sm text-muted-foreground text-center max-w-md mb-6'>
            {message}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant='outline'>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
