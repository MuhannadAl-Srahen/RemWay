// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

import type { ChallengeListItem } from './challenge'
import type { ResourceItem } from './resource'

export interface ChallengeItemProps {
  challenge: ChallengeListItem
  isSaved: boolean
  isSaving?: boolean
  isAuthenticated?: boolean
  onToggleSave: (challengeId: string) => void
}

export interface ChallengeControlsProps {
  searchTerm: string
  selectedDifficulty: string
  selectedLanguage: string
  onSearchChange: (value: string) => void
  onDifficultyChange: (value: string) => void
  onLanguageChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  filteredCount: number
  totalCount: number
}

export interface ChallengeViewProps {
  challenges: ChallengeListItem[]
  savedChallenges: string[]
  savingChallengeId?: string | null
  onToggleSave: (challengeId: string) => void
  viewMode: 'grid' | 'list'
  isAuthenticated?: boolean
}

export interface ChallengeFiltersProps {
  selectedDifficulty: string
  selectedLanguage: string
  onDifficultyChange: (value: string) => void
  onLanguageChange: (value: string) => void
}

export interface ResourceGridProps {
  resources: ResourceItem[]
  viewMode?: 'grid' | 'list'
}

export interface ResourceControlsProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  selectedDifficulty: string
  onDifficultyChange: (value: string) => void
  selectedType: string
  onTypeChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  filteredCount: number
  totalCount: number
}
