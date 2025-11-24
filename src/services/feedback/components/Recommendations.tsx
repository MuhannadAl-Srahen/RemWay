import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, ArrowRight, BookOpen, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

interface RecommendedChallenge {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  technologies: string[]
  description: string
}

interface LearningResource {
  title: string
  description: string
  link: string
}

interface RecommendationsProps {
  nextChallenges?: RecommendedChallenge[]
  learningResources: LearningResource[]
  onStartChallenge?: (id: string) => void
}

export function Recommendations({
  nextChallenges = [],
  learningResources,
  onStartChallenge,
}: RecommendationsProps) {
  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20',
    hard: 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20',
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* Recommended Next Challenges */}
      {nextChallenges.length > 0 && (
        <Card className='bg-card border shadow-sm'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Lightbulb className='h-5 w-5 text-primary' />
              <CardTitle className='text-lg font-semibold'>
                Recommended Next
              </CardTitle>
            </div>
            <p className='text-sm text-muted-foreground mt-1'>
              Based on your current skills
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            {nextChallenges.map((challenge, idx) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className='space-y-3'
              >
                <div>
                  <h3 className='text-base font-bold text-foreground mb-2'>
                    {challenge.title}
                  </h3>
                  <p className='text-sm text-muted-foreground mb-3'>
                    {challenge.description}
                  </p>

                  <div className='flex flex-wrap items-center gap-2 mb-4'>
                    <Badge
                      variant='outline'
                      className={difficultyColors[challenge.difficulty]}
                    >
                      {challenge.difficulty.charAt(0).toUpperCase() +
                        challenge.difficulty.slice(1)}
                    </Badge>
                    {challenge.technologies.map((tech, techIdx) => (
                      <Badge key={techIdx} variant='secondary' className='text-xs'>
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={() => onStartChallenge?.(challenge.id)}
                    className='w-full hover:bg-primary/90 transition-all cursor-pointer'
                  >
                    Start Challenge
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </div>
                {idx < nextChallenges.length - 1 && (
                  <div className='border-t border-border' />
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Learning Resources */}
      <Card className='bg-card border shadow-sm'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5 text-primary' />
            <CardTitle className='text-lg font-semibold'>
              Recommended Learning Resources
            </CardTitle>
          </div>
          <p className='text-sm text-muted-foreground mt-1'>
            Curated resources to help you improve
          </p>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {learningResources.map((resource, idx) => (
              <motion.a
                key={idx}
                href={resource.link}
                target='_blank'
                rel='noopener noreferrer'
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className='block p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all group cursor-pointer'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex-1'>
                    <h4 className='text-sm font-semibold text-foreground mb-1'>
                      {resource.title}
                    </h4>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      {resource.description}
                    </p>
                  </div>
                  <ChevronRight className='h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1' />
                </div>
              </motion.a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
