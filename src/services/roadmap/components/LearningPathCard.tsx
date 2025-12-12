import React, { useMemo, useState } from 'react'
// Link removed: card CTA handles navigation via Continue Path when started
import type { LearningPath } from '../../../types/roadmap'

import { BookOpen, Zap, Trophy, AlertTriangle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  useProfile,
  useUpdateProfile,
} from '@/services/profile/hooks/useProfile'
import { usePassedChallenges } from '@/services/profile/hooks/usePassedChallenges'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useChallenges } from '@/services/challenges/hooks/useChallenges'
import { useAuth } from '@/services/challenges/hooks/useAuth'
import { AuthPromptDialog } from '@/components/ui/auth-prompt-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabaseClient'

const ICON_GRADIENTS = {
  beginner: 'bg-primary/10',
  intermediate: 'bg-primary/10',
  advanced: 'bg-primary/10',
}
const ICONS = {
  beginner: <BookOpen className='w-5 h-5 text-primary' />,
  intermediate: <Zap className='w-5 h-5 text-primary' />,
  advanced: <Trophy className='w-5 h-5 text-primary' />,
}
const CTA_COLORS = {
  beginner: 'bg-primary hover:bg-primary/90 focus:ring-primary/20',
  intermediate: 'bg-primary hover:bg-primary/90 focus:ring-primary/20',
  advanced: 'bg-primary hover:bg-primary/90 focus:ring-primary/20',
}
const CTA_LABELS = {
  beginner: 'Start Beginner Path →',
  intermediate: 'Start Intermediate Path →',
  advanced: 'Start Advanced Path →',
}
// CTA_LINKS removed; navigation handled elsewhere when needed
const CTA_LINKS = {
  beginner: '/roadmap/beginner',
  intermediate: '/roadmap/intermediate',
  advanced: '/roadmap/advanced',
}
const FEATURE_LIST = {
  beginner: [
    'HTML & CSS Fundamentals',
    'Responsive Design Basics',
    'JavaScript Introduction',
  ],
  intermediate: [
    'React Components & Hooks',
    'API Integration',
    'State Management',
  ],
  advanced: [
    'TypeScript Mastery',
    'Testing Strategies',
    'Performance Optimization',
  ],
}
const TITLE_COLORS = {
  beginner: 'text-foreground',
  intermediate: 'text-foreground',
  advanced: 'text-foreground',
}
const SUBTITLE_COLORS = {
  beginner: 'text-primary',
  intermediate: 'text-primary',
  advanced: 'text-primary',
}

interface LearningPathCardProps {
  path: LearningPath
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ path }) => {
  const key = path.id as keyof typeof ICONS
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  // Auth check - fast and cached
  const { data: authData, isLoading: isAuthLoading } = useAuth()
  const isAuthenticated = authData?.isAuthenticated ?? false
  const userId = authData?.session?.user?.id
  
  // Only fetch profile when authenticated
  const { data: profile, isLoading: isProfileLoading } = useProfile(
    isAuthenticated ? userId : undefined
  )
  const updateProfile = useUpdateProfile()
  const started = Boolean(profile?.learningPaths?.[path.id]?.started)
  
  // Check if user has already started ANY other path
  const startedPaths = profile?.learningPaths 
    ? Object.entries(profile.learningPaths)
        .filter(([, data]) => data?.started)
        .map(([pathId]) => pathId)
    : []
  const hasOtherStartedPath = startedPaths.length > 0 && !startedPaths.includes(path.id)
  const otherStartedPathName = hasOtherStartedPath 
    ? startedPaths[0].charAt(0).toUpperCase() + startedPaths[0].slice(1) + ' Path'
    : null

  // Use real submission data for passed challenges (score >= 45)
  // Only load when authenticated
  const { passedChallengeIds, isLoading: isSubmissionsLoading } =
    usePassedChallenges()

  const { data: allChallenges = [], isLoading: isChallengesLoading } =
    useChallenges()

  const difficultyLabel =
    key === 'beginner'
      ? 'Beginner'
      : key === 'intermediate'
        ? 'Intermediate'
        : 'Advanced'

  // Filter challenges for this difficulty
  const challengesForDifficulty = useMemo(
    () => allChallenges.filter((c) => c.difficulty === difficultyLabel),
    [allChallenges, difficultyLabel]
  )

  const totalForDifficulty = challengesForDifficulty.length

  // Count passed challenges for this difficulty
  const completedCount = useMemo(() => {
    const challengeIdsForDifficulty = new Set(
      challengesForDifficulty.map((c) => c.id)
    )
    return Array.from(passedChallengeIds).filter((id) =>
      challengeIdsForDifficulty.has(id)
    ).length
  }, [passedChallengeIds, challengesForDifficulty])

  // Calculate progress percentage
  const progress =
    totalForDifficulty > 0
      ? Math.round((completedCount / totalForDifficulty) * 100)
      : 0

  // Only show loading for challenges (essential) - don't wait for profile/submissions for initial render
  const isLoading = isChallengesLoading
  // User-specific loading (for progress display)
  const isUserDataLoading = isAuthLoading || (isAuthenticated && (isProfileLoading || isSubmissionsLoading))

  // Handle sign in
  const handleSignIn = async () => {
    setShowAuthDialog(false)
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/roadmap',
      },
    })
  }

  // Handle starting the path
  const handleStartPath = () => {
    if (!profile?.id) return
    
    // Merge with existing learningPaths instead of replacing
    const existingPaths = profile.learningPaths || {}
    const updatedPaths = {
      ...existingPaths,
      [path.id]: {
        started: true,
        progress: 0,
        completedChallenges: [],
      },
    }
    updateProfile.mutate({
      userId: profile.id,
      updates: { learningPaths: updatedPaths },
    })
    setShowConfirmDialog(false)
  }

  return (
    <>
      <AuthPromptDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSignIn={handleSignIn}
        variant='roadmap'
      />
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              {hasOtherStartedPath && (
                <AlertTriangle className='h-5 w-5 text-amber-500' />
              )}
              {hasOtherStartedPath ? 'Switch Learning Path?' : 'Start Learning Path?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasOtherStartedPath ? (
                <>
                  You already have the <span className='font-semibold text-foreground'>{otherStartedPathName}</span> in progress. 
                  Starting this path won't reset your progress, but we recommend focusing on one path at a time for the best learning experience.
                </>
              ) : (
                <>
                  Are you sure you want to start the <span className='font-semibold text-foreground'>{path.title}</span>? 
                  You can always switch paths later, and your progress will be saved.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartPath}>
              {hasOtherStartedPath ? 'Start Anyway' : 'Start Path'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Link to={CTA_LINKS[key]} className='w-full h-full'>
      <div className='rounded-3xl h-full w-full transition-all duration-300 group hover:shadow-2xl'>
        <div className='rounded-3xl border border-border/50 bg-card shadow-sm transition-all duration-300 flex flex-col h-full w-full px-6 md:px-8 pt-7 pb-8 relative hover:scale-[1.01] hover:shadow-xl hover:border-primary/20 active:scale-[0.98] overflow-hidden'>
          {/* Background decoration */}
          <div className='absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/5 to-transparent rounded-full blur-2xl -translate-y-16 translate-x-16'></div>
          {/* Header Section */}
          <div className='mb-6 relative z-10'>
            {/* Icon and Title Section */}
            <div className='flex items-center gap-4 mb-4'>
              <div
                className={`rounded-xl w-14 h-14 p-3 ${ICON_GRADIENTS[key]} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 shrink-0`}
              >
                {ICONS[key]}
              </div>
              <div className='flex-1'>
                <h2
                  className={`text-2xl font-bold ${TITLE_COLORS[key]} leading-tight mb-2`}
                >
                  {key === 'beginner' && 'Beginner Path'}
                  {key === 'intermediate' && 'Intermediate Path'}
                  {key === 'advanced' && 'Advanced Path'}
                </h2>
                <div
                  className={`text-base font-semibold ${SUBTITLE_COLORS[key]}`}
                >
                  {key === 'beginner' && 'Start from Zero'}
                  {key === 'intermediate' && 'Level Up Your Skills'}
                  {key === 'advanced' && 'Professional Mastery'}
                </div>
              </div>
            </div>
          </div>
          {/* Description */}
          <div className='mb-4 md:mb-6 relative z-10'>
            <p className='text-muted-foreground text-left text-sm md:text-base leading-relaxed line-clamp-3 transform-none'>
              {path.description}
            </p>
          </div>
          {/* Feature List */}
          <ul className='mb-6 md:mb-8 space-y-2 md:space-y-3 relative z-10'>
            {FEATURE_LIST[key].map((item) => (
              <li key={item} className='flex items-start gap-3'>
                <div className='w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary shrink-0 mt-1.5 md:mt-2'></div>
                <span className='text-xs md:text-sm text-muted-foreground font-medium'>
                  {item}
                </span>
              </li>
            ))}
          </ul>
          {/* Stat Cards Row */}
          <div className='flex items-center gap-3 md:gap-4 mb-6 md:mb-8 relative z-10'>
            <div className='flex-1 bg-card rounded-xl py-2 md:py-3 px-3 md:px-4 flex flex-col items-center justify-center border border-border/50 shadow-sm transition-all duration-300 hover:shadow-md'>
              <span className='text-base md:text-lg font-bold text-foreground leading-none'>
                {path.duration}
              </span>
              <span className='text-xs text-muted-foreground font-medium mt-0.5 md:mt-1'>
                Duration
              </span>
            </div>
            <div className='flex-1 bg-card rounded-xl py-2 md:py-3 px-3 md:px-4 flex flex-col items-center justify-center border border-border/50 shadow-sm transition-all duration-300 hover:shadow-md'>
              {isLoading || isUserDataLoading ? (
                <Skeleton className='h-5 w-12 mb-1' />
              ) : (
                <span className='text-base md:text-lg font-bold text-primary leading-none'>
                  {completedCount}/{totalForDifficulty}
                </span>
              )}
              <span className='text-xs text-muted-foreground font-medium mt-0.5 md:mt-1'>
                Completed
              </span>
            </div>
          </div>
          {/* CTA / Start Button */}
          <div className='mt-4 mb-1 relative z-10 w-full'>
            {!started ? (
              <div className='w-full'>
                <Button
                  className={`w-full ${CTA_COLORS[key]}`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    
                    // If not authenticated, show sign-in dialog
                    if (!isAuthenticated) {
                      setShowAuthDialog(true)
                      return
                    }
                    
                    // Show confirmation dialog
                    setShowConfirmDialog(true)
                  }}
                  aria-label={`Start ${key} path`}
                >
                  {CTA_LABELS[key]}
                </Button>
              </div>
            ) : (
              <div className='w-full'>
                {/* Progress line (no numeric percent shown) */}
                <div className='w-full bg-muted rounded-full h-3 overflow-hidden border border-border/40'>
                  {isLoading || isUserDataLoading ? (
                    <Skeleton className='h-full w-1/3' />
                  ) : (
                    <div
                      className='h-full bg-primary transition-all duration-500'
                      style={{ width: `${progress}%` }}
                      aria-hidden
                    />
                  )}
                </div>
                {/* Small row: weeks on left, completed on right (responsive) */}
                <div className='flex items-center justify-between mt-3 gap-2'>
                  <div className='text-sm font-semibold text-foreground'>
                    {path.duration}
                  </div>
                  {isLoading || isUserDataLoading ? (
                    <Skeleton className='h-4 w-20' />
                  ) : (
                    <div className='text-sm text-muted-foreground'>
                      {completedCount}/{totalForDifficulty} completed
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
    </>
  )
}

export default LearningPathCard
