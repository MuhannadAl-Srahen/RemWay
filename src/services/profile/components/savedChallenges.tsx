import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ChallengeGridItem } from '@/services/challenges/components/ChallengeGridItem'
import { useChallenges } from '@/services/challenges/hooks/useChallenges'
import {
  useSavedChallenges,
  useToggleSave,
} from '@/services/challenges/hooks/useSavedChallenges'
import { useAuth } from '@/services/challenges/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { Heart, ArrowRight } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { usePagination } from '@/lib/usePagination'
import { motion, AnimatePresence } from 'motion/react'
import type { ChallengeListItem } from '@/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4 },
  },
}

export function SavedChallenges() {
  const navigate = useNavigate()

  // Use React Query hooks
  const { data: authData, isLoading: isAuthLoading } = useAuth()
  const { data: allChallenges = [], isLoading: isChallengesLoading } =
    useChallenges()
  const { data: savedChallengeIds = [], isLoading: isSavedLoading } =
    useSavedChallenges(authData?.isAuthenticated ?? false)
  const toggleSaveMutation = useToggleSave()

  const isAuthenticated = authData?.isAuthenticated ?? false
  const isLoading =
    isAuthLoading || isChallengesLoading || (isAuthenticated && isSavedLoading)

  // Filter challenges that are saved
  const savedChallenges: ChallengeListItem[] = allChallenges.filter(
    (challenge) => savedChallengeIds.includes(challenge.id)
  )

  // Pagination with usePagination hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedItems: currentChallenges,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(savedChallenges, {
    storageKey: 'profile-saved-challenges',
    defaultItemsPerPage: 2,
    scrollTopOffset: 400,
  })

  const handleToggleSave = async (challengeId: string) => {
    // Must be authenticated to save
    if (!isAuthenticated) {
      console.warn('[handleToggleSave] ⚠️ User not authenticated')
      return
    }

    // Prevent double-clicking while mutation is in progress
    if (toggleSaveMutation.isPending) {
      console.log('[handleToggleSave] ⏳ Already processing a save request')
      return
    }

    const isSaved = savedChallengeIds.includes(challengeId)
    console.log(
      `[handleToggleSave] ${isSaved ? 'Unsaving' : 'Saving'} challenge:`,
      challengeId
    )

    // Trigger the mutation
    toggleSaveMutation.mutate({ challengeId, isSaved })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='bg-card border border-border rounded-xl p-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-9 h-9 bg-muted rounded-lg animate-pulse' />
            <div>
              <div className='h-5 w-32 bg-muted rounded animate-pulse mb-2' />
              <div className='h-4 w-24 bg-muted rounded animate-pulse' />
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='bg-card border border-border rounded-xl p-6 animate-pulse'
            >
              <div className='h-48 bg-muted rounded-lg mb-4' />
              <div className='h-4 bg-muted rounded mb-2' />
              <div className='h-4 bg-muted rounded w-2/3 mb-4' />
              <div className='flex gap-2'>
                <div className='h-6 bg-muted rounded-full w-16' />
                <div className='h-6 bg-muted rounded-full w-20' />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className='bg-card border border-border rounded-xl p-12 text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.01]'>
        <div className='p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-full w-fit mx-auto mb-6'>
          <Heart className='w-12 h-12 text-yellow-500' />
        </div>
        <h3 className='text-xl font-semibold text-foreground mb-3'>
          Sign In Required
        </h3>
        <p className='text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed'>
          Please sign in to view your saved challenges.
        </p>
        <Button
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: 'github',
              options: {
                redirectTo: window.location.origin + '/profile?tab=saved',
              },
            })
          }}
          className='gap-2 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]'
        >
          <span>Sign In with GitHub</span>
          <ArrowRight className='w-4 h-4' />
        </Button>
      </div>
    )
  }

  if (savedChallenges.length === 0) {
    return (
      <div className='bg-card border border-border rounded-xl p-12 text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.01]'>
        <div className='p-4 bg-red-50 dark:bg-red-950/20 rounded-full w-fit mx-auto mb-6'>
          <Heart className='w-12 h-12 text-red-500' />
        </div>
        <h3 className='text-xl font-semibold text-foreground mb-3'>
          No Saved Challenges
        </h3>
        <p className='text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed'>
          Start exploring challenges and save the ones you want to tackle later.
          Build your personal collection of interesting projects.
        </p>
        <Button
          onClick={() => navigate({ to: '/challenges' })}
          className='gap-2 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]'
        >
          <span>Explore Challenges</span>
          <ArrowRight className='w-4 h-4' />
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <div className='p-2 bg-red-50 dark:bg-red-950/20 rounded-lg'>
                <Heart className='w-5 h-5 text-red-500 fill-red-500' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-foreground'>
                  Saved Challenges
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {savedChallenges.length} challenge
                  {savedChallenges.length !== 1 ? 's' : ''} saved for later
                </p>
              </div>
            </div>
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate({ to: '/challenges' })}
            className='gap-2 w-fit transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.02]'
          >
            <span>Browse More</span>
            <ArrowRight className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Challenges Grid with Animation */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentPage}
          className='grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          {currentChallenges.map((challenge) => (
            <motion.div key={challenge.id} variants={itemVariants}>
              <ChallengeGridItem
                challenge={challenge}
                isSaved={savedChallengeIds.includes(challenge.id)}
                isSaving={
                  toggleSaveMutation.isPending &&
                  toggleSaveMutation.variables?.challengeId === challenge.id
                }
                isAuthenticated={isAuthenticated}
                onToggleSave={handleToggleSave}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls - only show if needed */}
      {(totalPages > 1 || totalItems > 2) && (
        <div className='bg-card border border-border rounded-xl p-4'>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={[2, 4, 6, 8]}
            className='mt-0'
          />
        </div>
      )}
    </div>
  )
}
