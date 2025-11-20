export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type ChallengeStatus = 'not_started' | 'in_progress' | 'completed'
export type FigmaAccessType = 'view' | 'edit'

export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: DifficultyLevel
  category: string
  tags: string[]
  design_url: string
  figma_access_type: FigmaAccessType
  assets_url?: string
  created_at: string
  updated_at: string
  estimated_time?: number
  learning_outcomes?: string[]
  preview_image?: string
}

export interface ChallengeWithProgress extends Challenge {
  user_progress?: UserChallengeProgress
  is_saved?: boolean
}

export interface UserChallengeProgress {
  id: string
  user_id: string
  challenge_id: string
  status: ChallengeStatus
  started_at: string
  completed_at?: string
  last_accessed: string
  progress_percentage: number
  notes?: string
}

export interface ChallengeSubmission {
  id: string
  user_id: string
  challenge_id: string
  submission_url: string
  github_url?: string
  live_url?: string
  description?: string
  screenshots?: string[]
  submitted_at: string
  feedback?: ChallengeFeedback
  score?: number
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
}

export interface ChallengeFeedback {
  id: string
  submission_id: string
  reviewer_id?: string
  overall_score: number
  design_accuracy: number
  code_quality: number
  responsiveness: number
  accessibility: number
  comments: string
  suggestions?: string[]
  created_at: string
}

export interface SavedChallenge {
  id: string
  user_id: string
  challenge_id: string
  saved_at: string
  notes?: string
  challenge?: Challenge
}

export interface ChallengeFilters {
  difficulty?: DifficultyLevel[]
  category?: string[]
  tags?: string[]
  status?: ChallengeStatus[]
  search?: string
}

export interface ChallengeSortOptions {
  field: 'created_at' | 'difficulty' | 'title' | 'estimated_time'
  direction: 'asc' | 'desc'
}

export interface ChallengeStats {
  total_challenges: number
  completed_challenges: number
  in_progress_challenges: number
  total_time_spent: number
  average_score: number
}

// For Supabase database types
export interface DbChallenge {
  id: string
  title: string
  description: string
  difficulty: DifficultyLevel
  category: string
  tags: string[]
  design_url: string
  figma_access_type: FigmaAccessType
  assets_url: string | null
  created_at: string
  updated_at: string
  estimated_time: number | null
  learning_outcomes: string[] | null
  preview_image: string | null
}

export interface DbChallengeProgress {
  id: string
  user_id: string
  challenge_id: string
  status: ChallengeStatus
  started_at: string
  completed_at: string | null
  last_accessed: string
  progress_percentage: number
  notes: string | null
}

export interface DbChallengeSubmission {
  id: string
  user_id: string
  challenge_id: string
  submission_url: string
  github_url: string | null
  live_url: string | null
  description: string | null
  screenshots: string[] | null
  submitted_at: string
  score: number | null
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
}

export interface DbSavedChallenge {
  id: string
  user_id: string
  challenge_id: string
  saved_at: string
  notes: string | null
}
