import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

interface IssueFixed {
  issue: string
  was_fixed: boolean
  details: string
}

interface ImprovementsFromPreviousProps {
  issuesFixed: IssueFixed[]
  previousScore: number
  currentScore: number
  overallAssessment: string
}

export function ImprovementsFromPrevious({
  issuesFixed,
  previousScore,
  currentScore,
  overallAssessment,
}: ImprovementsFromPreviousProps) {
  // Handle edge cases with safe defaults
  const safeIssuesFixed = issuesFixed || []
  const safePreviousScore = previousScore ?? 0
  const safeCurrentScore = currentScore ?? 0

  const fixedCount = safeIssuesFixed.filter((i) => i?.was_fixed).length
  const totalIssues = safeIssuesFixed.length
  const fixRate =
    totalIssues > 0 ? Math.round((fixedCount / totalIssues) * 100) : 0

  const scoreChange = safeCurrentScore - safePreviousScore
  const isImproved = scoreChange > 0
  const isRegressed = scoreChange < 0

  // Don't render if no issues to show
  if (totalIssues === 0) {
    return null
  }

  return (
    <Card className='bg-card border shadow-sm'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-xl font-bold flex items-center gap-2'>
            <TrendingUp className='h-5 w-5 text-primary' />
            Progress Since Last Submission
          </CardTitle>
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              isImproved
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : isRegressed
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {isImproved ? (
              <ArrowUp className='h-4 w-4' />
            ) : isRegressed ? (
              <ArrowDown className='h-4 w-4' />
            ) : (
              <Minus className='h-4 w-4' />
            )}
            {scoreChange > 0 ? '+' : ''}
            {scoreChange} points
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Score Comparison */}
        <div className='grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg'>
          <div className='text-center'>
            <p className='text-sm text-muted-foreground mb-1'>Previous Score</p>
            <p className='text-2xl font-bold text-muted-foreground'>
              {safePreviousScore}
            </p>
          </div>
          <div className='text-center flex flex-col items-center justify-center'>
            {isImproved ? (
              <TrendingUp className='h-8 w-8 text-green-500' />
            ) : isRegressed ? (
              <TrendingDown className='h-8 w-8 text-red-500' />
            ) : (
              <Minus className='h-8 w-8 text-muted-foreground' />
            )}
          </div>
          <div className='text-center'>
            <p className='text-sm text-muted-foreground mb-1'>Current Score</p>
            <p
              className={`text-2xl font-bold ${
                isImproved
                  ? 'text-green-600 dark:text-green-400'
                  : isRegressed
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-foreground'
              }`}
            >
              {safeCurrentScore}
            </p>
          </div>
        </div>

        {/* Fix Rate Progress */}
        <div>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-medium text-foreground'>
              Issues Addressed
            </span>
            <span className='text-sm text-muted-foreground'>
              {fixedCount} of {totalIssues} fixed ({fixRate}%)
            </span>
          </div>
          <div className='w-full bg-muted rounded-full h-2'>
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                fixRate >= 80
                  ? 'bg-green-500'
                  : fixRate >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${fixRate}%` }}
            />
          </div>
        </div>

        {/* Issues List */}
        <div className='space-y-3'>
          <h4 className='font-medium text-foreground'>
            Issue-by-Issue Breakdown:
          </h4>
          {safeIssuesFixed.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                item.was_fixed
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              }`}
            >
              <div className='flex items-start gap-3'>
                <div
                  className={`shrink-0 mt-0.5 ${
                    item.was_fixed
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {item.was_fixed ? (
                    <CheckCircle className='h-5 w-5' />
                  ) : (
                    <XCircle className='h-5 w-5' />
                  )}
                </div>
                <div className='flex-1'>
                  <p
                    className={`font-medium text-sm ${
                      item.was_fixed
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-red-800 dark:text-red-300'
                    }`}
                  >
                    {item.was_fixed ? '✓ Fixed: ' : '✗ Still needs work: '}
                    {item.issue}
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {item.details}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Assessment */}
        <div className='p-4 bg-primary/5 rounded-lg border border-primary/20'>
          <p className='text-sm font-medium text-primary mb-1'>
            AI Assessment:
          </p>
          <p className='text-foreground'>
            {overallAssessment || 'No assessment available'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
