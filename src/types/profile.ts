export interface UserProfile {
  id: string
  user_id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  github_username?: string
  twitter_username?: string
  linkedin_url?: string
  created_at: string
  updated_at: string
}

export interface ProfileStats {
  challenges_completed: number
  challenges_in_progress: number
  total_points: number
  current_streak: number
  longest_streak: number
  rank?: number
  percentile?: number
}

export interface ProfileLearningPath {
  id: string
  name: string
  description: string
  progress: number
  total_challenges: number
  completed_challenges: number
  estimated_hours: number
}

export interface Activity {
  id: string
  user_id: string
  type:
    | 'challenge_started'
    | 'challenge_completed'
    | 'submission_made'
    | 'feedback_received'
  challenge_id?: string
  challenge_title?: string
  details?: string
  created_at: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned_at?: string
  progress?: number
  total?: number
}

export interface SkillProgress {
  skill_name: string
  level: number
  experience: number
  next_level_experience: number
  challenges_completed: number
}

export interface ProfileUpdate {
  username?: string
  full_name?: string
  bio?: string
  location?: string
  website?: string
  github_username?: string
  twitter_username?: string
  linkedin_url?: string
}

// Database types
export interface DbProfile {
  id: string
  user_id: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  github_username: string | null
  twitter_username: string | null
  linkedin_url: string | null
  created_at: string
  updated_at: string
}

export interface DbActivity {
  id: string
  user_id: string
  type: string
  challenge_id: string | null
  challenge_title: string | null
  details: string | null
  created_at: string
}
