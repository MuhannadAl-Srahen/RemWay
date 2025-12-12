import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Eye, Code2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

interface FeedbackHeaderProps {
  challengeTitle: string
  challengeId: string
  submittedDate: string
  liveUrl?: string
  githubUrl?: string
  overallScore: number
}

export function FeedbackHeader({
  challengeTitle,
  challengeId,
  submittedDate,
  liveUrl,
  githubUrl,
  overallScore,
}: FeedbackHeaderProps) {
  const navigate = useNavigate()

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Great'
    if (score >= 70) return 'Good'
    return 'Needs Work'
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      {/* Back Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() =>
          navigate({ to: '/challenges/$id', params: { id: challengeId } })
        }
        className='mb-6 hover:bg-muted hover:border-primary transition-all cursor-pointer'
      >
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Challenge
      </Button>

      <Card className='bg-card border shadow-sm'>
        <CardContent className='pt-6 pb-6'>
          {/* Header Content */}
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
            {/* Left Side - Title and Buttons */}
            <div className='flex-1'>
              <h1 className='text-2xl font-bold text-primary mb-3'>
                {challengeTitle}
              </h1>
              <p className='text-sm text-muted-foreground mb-4'>
                Submitted on {submittedDate}
              </p>

              <div className='flex flex-wrap items-center gap-3'>
                {liveUrl && (
                  <a href={liveUrl} target='_blank' rel='noopener noreferrer'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='hover:bg-primary/10 hover:border-primary transition-all cursor-pointer'
                    >
                      <Eye className='h-4 w-4 mr-2' />
                      Live Preview
                    </Button>
                  </a>
                )}
                {githubUrl && (
                  <a href={githubUrl} target='_blank' rel='noopener noreferrer'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='hover:bg-primary/10 hover:border-primary transition-all cursor-pointer'
                    >
                      <Code2 className='h-4 w-4 mr-2' />
                      View Code
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Right Side - Score */}
            <div className='flex flex-col items-center bg-muted/30 rounded-lg px-8 py-5 border border-border min-w-40'>
              <div
                className={`text-6xl font-bold ${getScoreColor(overallScore)} leading-none`}
              >
                {overallScore}
              </div>
              <div className='text-sm font-medium text-foreground mt-3'>
                Overall Score
              </div>
              <div className='text-xs text-muted-foreground mt-1'>
                {getScoreLabel(overallScore)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
