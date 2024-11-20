// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface UserProfile {
  id: string
  username: string
  fullName: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  githubUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  /** Learning paths state saved on the profile (started/progress/completed challenges) */
  learningPaths?: Record<
    string,
    {
      started: boolean
      progress: number
      completedChallenges: string[]
    }
  >
  skills: string[]
  experience: ExperienceLevel
  joinedAt: string
  stats: ProfileStats
}

export interface ProfileStats {
  challengesCompleted: number
  totalSubmissions: number
  averageRating: number
  currentStreak: number
  longestStreak: number
  totalPoints: number
}

export type ExperienceLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert'

export interface UserData {
  fullName: string
  username: string
  initials: string
  avatarUrl?: string
}

// Database profile type (matching schema)
export interface DbProfile {
  id: string
  full_name: string | null
  email: string | null
  bio: string | null
  skills: string[] | null
  social_links: Record<string, unknown> | null
  joined_date: string | null
  profile_image_url: string | null
  saved_challenges: unknown | null
  github_url: string | null
}

export interface SavedChallenge {
  id: string
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  description: string
  image?: string
  estimatedTime: string
  submissions: number
  savedAt: string
}

export interface Submission {
  id: string
  challenge_id: string
  challenge_title: string
  github_url: string
  live_site_url: string
  submitted_at: string
  screenshots: string[] | null
}
