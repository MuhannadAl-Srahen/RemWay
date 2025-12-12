import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/layouts'
import {
  ChallengePageHeader,
  ChallengeControls,
  ChallengeView,
  useChallengeFilters,
} from '@/services/challenges'
import { EmptyState } from '@/layouts'
import {
  ChallengeCardSkeleton,
  ChallengeListSkeleton,
} from '@/components/ui/challenge-skeleton'
import { useChallenges } from '@/services/challenges/hooks/useChallenges'
import { useAuth } from '@/services/challenges/hooks/useAuth'
import {
  useSavedChallenges,
  useToggleSave,
} from '@/services/challenges/hooks/useSavedChallenges'
import { Pagination } from '@/components/ui/pagination'
import { usePagination } from '@/lib/usePagination'

export const Route = createFileRoute('/challenges/')({
  component: RouteComponent,
})

function RouteComponent() {
  // Load saved view mode from sessionStorage
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = sessionStorage.getItem('challenges-view-mode')
    return (saved as 'grid' | 'list') || 'grid'
  })

  // Save view mode to sessionStorage whenever it changes
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    sessionStorage.setItem('challenges-view-mode', mode)
  }

  // Use React Query hooks for data fetching
  const { data: authData, isLoading: isAuthLoading } = useAuth()
  const {
    data: allChallenges = [],
    isLoading: isChallengesLoading,
    error: challengesError,
  } = useChallenges()
  const { data: savedChallenges = [], isLoading: isSavedLoading } =
    useSavedChallenges(authData?.isAuthenticated ?? false)
  const toggleSaveMutation = useToggleSave()

  const isAuthenticated = authData?.isAuthenticated ?? false
  const isLoading =
    isAuthLoading || isChallengesLoading || (isAuthenticated && isSavedLoading)

  const {
    searchTerm,
    selectedDifficulty,
    selectedLanguage,
    filteredChallenges,
    setSearchTerm,
    setSelectedDifficulty,
    setSelectedLanguage,
    clearFilters,
  } = useChallengeFilters(allChallenges)

  // Pagination - 9 items per page for grid (3x3), 6 for list
  const defaultPerPage = viewMode === 'grid' ? 9 : 6
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedChallenges,
    handlePageChange,
    handleItemsPerPageChange,
    resetPage,
  } = usePagination(filteredChallenges, {
    storageKey: 'challenges',
    defaultItemsPerPage: defaultPerPage,
  })

  // Reset page when filters change
  useEffect(() => {
    resetPage()
  }, [searchTerm, selectedDifficulty, selectedLanguage, resetPage])

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

    const isSaved = savedChallenges.includes(challengeId)
    console.log(
      `[handleToggleSave] ${isSaved ? 'Unsaving' : 'Saving'} challenge:`,
      challengeId
    )

    toggleSaveMutation.mutate({ challengeId, isSaved })
  }

  // Get error message
  const errorMessage =
    challengesError instanceof Error
      ? challengesError.message
      : challengesError
        ? 'Failed to load challenges'
        : null

  return (
    <PageLayout maxWidth='6xl'>
      <ChallengePageHeader />

      <ChallengeControls
        searchTerm={searchTerm}
        selectedDifficulty={selectedDifficulty}
        selectedLanguage={selectedLanguage}
        onSearchChange={setSearchTerm}
        onDifficultyChange={setSelectedDifficulty}
        onLanguageChange={setSelectedLanguage}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        filteredCount={filteredChallenges.length}
        totalCount={allChallenges.length}
      />

      {errorMessage ? (
        // Show error state
        <EmptyState
          title='Failed to load challenges'
          message={errorMessage}
          buttonText='Retry'
          onAction={() => window.location.reload()}
        />
      ) : isLoading ? (
        // Show skeleton loading state
        viewMode === 'grid' ? (
          <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <ChallengeCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <ChallengeListSkeleton key={index} />
            ))}
          </div>
        )
      ) : filteredChallenges.length === 0 ? (
        <EmptyState
          title='No challenges found'
          message='Try adjusting your filters to see more challenges.'
          buttonText='Clear Filters'
          onAction={clearFilters}
        />
      ) : (
        <>
          <ChallengeView
            challenges={paginatedChallenges}
            savedChallenges={savedChallenges}
            savingChallengeId={
              toggleSaveMutation.isPending
                ? (toggleSaveMutation.variables?.challengeId ?? null)
                : null
            }
            onToggleSave={handleToggleSave}
            viewMode={viewMode}
            isAuthenticated={isAuthenticated}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={viewMode === 'grid' ? [6, 9, 12, 18] : [4, 6, 8, 12]}
          />
        </>
      )}
    </PageLayout>
  )
}
