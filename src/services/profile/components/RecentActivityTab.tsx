import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Inbox } from 'lucide-react'
import { useProfileSubmissions } from '@/services/profile/hooks/useProfileSubmissions'
import { useProfileStats } from '@/services/profile/hooks/useProfileStats'
import { Pagination } from '@/components/ui/pagination'
import { usePagination } from '@/lib/usePagination'
import { motion, AnimatePresence } from 'motion/react'
import '@/styles/profile.css'

/**
 * Format a timestamp into a human-readable relative time
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export function RecentActivityTab() {
  const { data: submissions = [], isLoading } = useProfileSubmissions(50)
  const { data: profileStats, isLoading: isStatsLoading } = useProfileStats()

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedItems: currentSubmissions,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(submissions, {
    storageKey: 'profile-recent-activity',
    defaultItemsPerPage: 5,
    scrollTopOffset: 400,
  })

  return (
    <div className='space-y-6'>
      {/* Quick Stats */}
      <div>
        <div className='flex items-center gap-3 mb-6'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <CheckCircle className='w-5 h-5 text-primary' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Quick Stats
            </h3>
            <p className='text-sm text-muted-foreground'>
              Your recent activity overview
            </p>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-2 sm:gap-3 md:gap-4'>
          {/* Completed Card */}
          <Card className='profile-card-blue relative overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer'>
            <div className='relative p-3 sm:p-4 md:p-5 text-center'>
              <div className='profile-icon-blue w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center'>
                <div className='w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full bg-background flex items-center justify-center'>
                  <div className='profile-icon-blue w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full'></div>
                </div>
              </div>
              {isStatsLoading ? (
                <Skeleton className='h-7 w-8 mx-auto mb-1' />
              ) : (
                <div className='profile-text-blue text-lg sm:text-xl md:text-2xl font-bold'>
                  {profileStats.challengesCompleted}
                </div>
              )}
              <div className='profile-text-blue-muted text-xs sm:text-sm mt-1'>
                Completed
              </div>
            </div>
          </Card>

          {/* Avg Score Card */}
          <Card className='profile-card-yellow relative overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer'>
            <div className='relative p-3 sm:p-4 md:p-5 text-center'>
              <div className='profile-icon-yellow w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center'>
                <svg
                  className='w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              </div>
              {isStatsLoading ? (
                <Skeleton className='h-7 w-12 mx-auto mb-1' />
              ) : (
                <div className='profile-text-yellow text-lg sm:text-xl md:text-2xl font-bold'>
                  {profileStats.averageRating}%
                </div>
              )}
              <div className='profile-text-yellow-muted text-xs sm:text-sm mt-1'>
                Avg Score
              </div>
            </div>
          </Card>

          {/* Streak Card */}
          <Card className='profile-card-green relative overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer'>
            <div className='relative p-3 sm:p-4 md:p-5 text-center'>
              <div className='profile-icon-green w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center'>
                <svg
                  className='w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              {isStatsLoading ? (
                <Skeleton className='h-7 w-8 mx-auto mb-1' />
              ) : (
                <div className='profile-text-green text-lg sm:text-xl md:text-2xl font-bold'>
                  {profileStats.currentStreak}
                </div>
              )}
              <div className='profile-text-green-muted text-xs sm:text-sm mt-1'>
                Day Streak
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Submissions */}
      <Card className='shadow-sm overflow-hidden bg-card border rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01]'>
        <div className='p-6 border-b border-border bg-muted/20'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <CheckCircle className='w-5 h-5 text-primary' />
            </div>
            <div>
              <h4 className='font-semibold text-foreground text-base'>
                Recent Submissions
              </h4>
              <p className='text-sm text-muted-foreground mt-1'>
                Your latest completed challenges
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='divide-y divide-border'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='p-4'>
                <div className='flex items-center gap-3 mb-3'>
                  <Skeleton className='w-5 h-5 rounded-full' />
                  <Skeleton className='h-5 w-48' />
                </div>
                <div className='flex gap-2 ml-8'>
                  <Skeleton className='h-5 w-20' />
                  <Skeleton className='h-5 w-16' />
                  <Skeleton className='h-5 w-16' />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && submissions.length === 0 && (
          <div className='p-12 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4'>
              <Inbox className='w-8 h-8 text-muted-foreground' />
            </div>
            <h4 className='font-semibold text-foreground mb-2'>
              No submissions yet
            </h4>
            <p className='text-sm text-muted-foreground max-w-sm mx-auto'>
              Start solving challenges to see your submissions here. Each
              completed challenge will appear in your activity feed.
            </p>
          </div>
        )}

        {/* Submissions List */}
        {!isLoading && submissions.length > 0 && (
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentPage}
              initial='hidden'
              animate='visible'
              exit='exit'
              transition={{ duration: 0.3 }}
              className='divide-y divide-border'
            >
              {currentSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className='p-4 relative overflow-hidden transition-all duration-300 hover:bg-muted/50 cursor-pointer group'
                >
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='shrink-0'>
                        <CheckCircle className='profile-check-icon w-5 h-5 transition-transform group-hover:scale-110' />
                      </div>
                      <h5 className='font-medium text-foreground text-base leading-tight group-hover:text-primary transition-colors'>
                        {submission.challengeTitle}
                      </h5>
                    </div>
                    <div className='flex flex-wrap items-center gap-2 ml-8'>
                      <Badge
                        variant='secondary'
                        className={`text-xs font-medium ${
                          submission.difficulty === 'Beginner'
                            ? 'profile-badge-beginner'
                            : submission.difficulty === 'Intermediate'
                              ? 'profile-badge-intermediate'
                              : 'profile-badge-advanced'
                        }`}
                      >
                        {submission.difficulty}
                      </Badge>
                      {submission.tags.slice(0, 3).map((tech) => (
                        <Badge
                          key={tech}
                          variant='outline'
                          className='text-xs hover:bg-primary/10 transition-colors'
                        >
                          {tech}
                        </Badge>
                      ))}
                      {submission.tags.length > 3 && (
                        <Badge
                          variant='outline'
                          className='text-xs text-muted-foreground'
                        >
                          +{submission.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className='text-xs text-muted-foreground mt-2 ml-8'>
                      {formatRelativeTime(submission.submittedAt)}
                    </div>
                  </div>
                  <div className='flex sm:flex-col items-center sm:items-end gap-2 ml-8 sm:ml-0'>
                    <div className='profile-score-text text-xl font-bold group-hover:scale-110 transition-transform'>
                      {submission.score ?? '—'}%
                    </div>
                    {/* Score indicator bar */}
                    <div className='w-16 sm:w-12 h-2 bg-muted rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-linear-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out'
                        style={{
                          width: `${submission.score ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        )}

        {/* Pagination Controls */}
        {!isLoading && submissions.length > 0 && (
          <div className='p-4 border-t border-border bg-muted/10'>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[3, 5, 10, 15]}
              className='mt-0'
            />
          </div>
        )}
      </Card>
    </div>
  )
}
