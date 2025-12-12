import { useState } from 'react'
import {
  Target,
  Code,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'
import '../../../styles/profile.css'
import { useChallenges } from '@/services/challenges/hooks/useChallenges'
import {
  useAllProfileSubmissions,
  isPassingSubmission,
} from '@/services/profile/hooks/useProfileSubmissions'

const TECH_ITEMS_PER_PAGE = 3

export function ProfileProgress() {
  const [techPage, setTechPage] = useState(0)
  const [slideDirection, setSlideDirection] = useState(0) // -1 for left, 1 for right
  const { data: allChallenges = [] } = useChallenges()
  const { data: submissions = [] } = useAllProfileSubmissions()

  // Get set of PASSED challenge IDs (score >= 45)
  const completedSet = new Set<string>(
    submissions.filter((s) => isPassingSubmission(s)).map((s) => s.challengeId)
  )

  // Build totals per difficulty
  const totalsByDifficulty = allChallenges.reduce(
    (acc, c) => {
      acc[c.difficulty] = (acc[c.difficulty] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const pathIds: Array<'beginner' | 'intermediate' | 'advanced'> = [
    'beginner',
    'intermediate',
    'advanced',
  ]

  const challengeById = new Map(allChallenges.map((c) => [c.id, c]))

  const learningPathStats = pathIds.map((id) => {
    const difficultyLabel =
      id === 'beginner'
        ? 'Beginner'
        : id === 'intermediate'
          ? 'Intermediate'
          : 'Advanced'

    // Count passed challenges for this difficulty
    const completed = Array.from(completedSet).filter((cid) => {
      const ch = challengeById.get(cid)
      return ch?.difficulty === difficultyLabel
    }).length

    const total = totalsByDifficulty[difficultyLabel] ?? 0
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { id, name: `${difficultyLabel} Path`, completed, total, percentage }
  })

  // Technology breakdown: count total challenges per tag and completed per tag
  const techTotals: Record<string, { total: number; completed: number }> = {}

  for (const ch of allChallenges) {
    if (!ch.tags) continue
    for (const tag of ch.tags) {
      techTotals[tag] = techTotals[tag] || { total: 0, completed: 0 }
      techTotals[tag].total += 1
    }
  }

  // Count completed (passed) challenges per tag
  for (const cid of completedSet) {
    const ch = challengeById.get(cid)
    if (!ch || !ch.tags) continue
    for (const tag of ch.tags) {
      techTotals[tag] = techTotals[tag] || { total: 0, completed: 0 }
      techTotals[tag].completed += 1
    }
  }

  // Ensure the profile shows a fixed set of technologies in the desired order
  const desiredTechs = [
    'HTML',
    'CSS',
    'JavaScript',
    'Tailwind CSS',
    'React',
    'TypeScript',
    'API',
  ]

  // Ensure each desired tech exists in the totals (even if zero)
  for (const dt of desiredTechs) {
    if (!techTotals[dt]) {
      techTotals[dt] = { total: 0, completed: 0 }
    }
  }

  // Build final entries with desiredTechs first, then the rest
  const finalTechEntries = [
    ...desiredTechs.map((name) => ({ name, ...techTotals[name] })),
    ...Object.keys(techTotals)
      .filter((n) => !desiredTechs.includes(n))
      .map((name) => ({ name, ...techTotals[name] }))
      .sort((a, b) => b.total - a.total),
  ]

  // Difficulty section (aggregate across difficulties with average scores)
  // Only count PASSED submissions (score >= 45)
  const difficultyStats = ['Beginner', 'Intermediate', 'Advanced'].map(
    (level) => {
      const completed = Array.from(completedSet).filter((cid) => {
        const ch = challengeById.get(cid)
        return ch?.difficulty === level
      }).length
      const total = totalsByDifficulty[level] ?? 0

      // Calculate average score for this difficulty from PASSING submissions only
      const passingSubmissionsForDifficulty = submissions.filter(
        (s) => s.difficulty === level && isPassingSubmission(s)
      )
      const avgScore =
        passingSubmissionsForDifficulty.length > 0
          ? Math.round(
              passingSubmissionsForDifficulty.reduce(
                (sum, s) => sum + (s.score || 0),
                0
              ) / passingSubmissionsForDifficulty.length
            )
          : 0
      return { level, completed, total, avgScore }
    }
  )

  return (
    <div className='space-y-6'>
      {/* Learning Path Progress */}
      <div className='bg-card border border-border rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.01]'>
        <div className='mb-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <Target className='w-5 h-5 text-primary' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground'>
                Learning Path Progress
              </h3>
              <p className='text-sm text-muted-foreground'>
                Your progress across different learning paths
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {learningPathStats.map((path) => (
            <div
              key={path.id}
              className={`p-4 rounded-lg border profile-card-${path.id} transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
            >
              <div className='text-center'>
                <div
                  className={`text-3xl font-bold profile-text-${path.id} mb-1`}
                >
                  {path.percentage}%
                </div>
                <div className={`font-medium profile-text-${path.id} mb-1`}>
                  {path.name}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {path.completed}/{path.total} Completed
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* By Technology */}
        <div className='bg-card border border-border rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.01]'>
          <div className='mb-6'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <Code className='w-5 h-5 text-primary' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-foreground'>
                  By Technology
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Challenges completed in each technology
                </p>
              </div>
            </div>
          </div>

          {/* Technology list with pagination */}
          {(() => {
            const totalTechPages = Math.ceil(
              finalTechEntries.length / TECH_ITEMS_PER_PAGE
            )
            const startIdx = techPage * TECH_ITEMS_PER_PAGE
            const visibleTechs = finalTechEntries.slice(
              startIdx,
              startIdx + TECH_ITEMS_PER_PAGE
            )

            return (
              <>
                <div className='min-h-56 overflow-hidden'>
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={techPage}
                      initial={{ opacity: 0, x: slideDirection * 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -slideDirection * 50 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className='space-y-4'
                    >
                      {visibleTechs.map((tech) => {
                        const safeName = tech.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                        return (
                          <div
                            key={tech.name}
                            className='space-y-2 transition-all duration-300 hover:bg-muted/50 rounded-lg p-3 cursor-pointer group'
                          >
                            <div className='flex items-center justify-between text-sm'>
                              <span className='font-medium group-hover:text-primary transition-colors'>
                                {tech.name}
                              </span>
                              <span className='text-muted-foreground'>
                                {tech.completed}/{tech.total}
                              </span>
                            </div>
                            <div className='w-full bg-muted border-2 border-border rounded-full h-3 overflow-hidden shadow-inner'>
                              <div
                                className={`h-full rounded-full profile-progress-${safeName} profile-progress-default transition-all duration-500 ease-out shadow-md border-2 border-white/20 dark:border-white/30`}
                                style={{
                                  width: `${(tech.total > 0 ? (tech.completed / tech.total) * 100 : 0).toFixed(1)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Pagination controls */}
                {totalTechPages > 1 && (
                  <div className='flex items-center justify-between mt-4 pt-4 border-t border-border'>
                    <span className='text-xs text-muted-foreground'>
                      {startIdx + 1}-
                      {Math.min(
                        startIdx + TECH_ITEMS_PER_PAGE,
                        finalTechEntries.length
                      )}{' '}
                      of {finalTechEntries.length}
                    </span>
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setSlideDirection(-1)
                          setTechPage((p) => Math.max(0, p - 1))
                        }}
                        disabled={techPage === 0}
                        className='h-8 w-8 p-0'
                      >
                        <ChevronLeft className='h-4 w-4' />
                      </Button>
                      <span className='text-xs text-muted-foreground px-2'>
                        {techPage + 1} / {totalTechPages}
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setSlideDirection(1)
                          setTechPage((p) =>
                            Math.min(totalTechPages - 1, p + 1)
                          )
                        }}
                        disabled={techPage >= totalTechPages - 1}
                        className='h-8 w-8 p-0'
                      >
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )
          })()}
        </div>

        {/* By Difficulty */}
        <div className='bg-card border border-border rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.01]'>
          <div className='mb-6'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <BarChart3 className='w-5 h-5 text-primary' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-foreground'>
                  By Difficulty
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Performance across difficulty levels
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            {difficultyStats.map((diff) => (
              <div
                key={diff.level}
                className='space-y-2 transition-all duration-300 hover:bg-muted/50 rounded-lg p-3 cursor-pointer group'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-3 h-3 rounded-full profile-indicator-${diff.level.toLowerCase()} transition-transform group-hover:scale-110`}
                    />
                    <span className='font-medium text-sm group-hover:text-primary transition-colors'>
                      {diff.level}
                    </span>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm font-medium'>
                      {diff.completed}/{diff.total}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      avg. {diff.avgScore}%
                    </div>
                  </div>
                </div>
                <div className='w-full bg-muted border-2 border-border rounded-full h-3 overflow-hidden shadow-inner'>
                  <div
                    className={`h-full rounded-full profile-progress-${diff.level.toLowerCase()} transition-all duration-500 ease-out shadow-md border-2 border-white/20 dark:border-white/30`}
                    style={{
                      width: `${diff.total > 0 ? (diff.completed / diff.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
