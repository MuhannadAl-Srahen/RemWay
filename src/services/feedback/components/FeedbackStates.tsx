import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export function FeedbackProcessing() {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20'>
      <Card className='bg-card border shadow-sm'>
        <CardContent className='flex flex-col items-center justify-center py-20'>
          <Clock className='h-12 w-12 text-yellow-500 mb-4 animate-pulse' />
          <h2 className='text-xl font-semibold text-foreground mb-2'>
            Analyzing Your Submission
          </h2>
          <p className='text-sm text-muted-foreground text-center max-w-md mb-4'>
            Our AI is carefully reviewing your code, design, and implementation
            details. This usually takes a few minutes.
          </p>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <div className='h-2 w-2 rounded-full bg-primary animate-pulse' />
            <span>Processing...</span>
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
