// ============================================================================
// CHALLENGE TYPES
// ============================================================================

export interface Challenge {
  id: string
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  description: string
  images: ChallengeImage[]
  livePreviewUrl: string
  estimatedTime: string
  completions: number
  submissions?: number // For compatibility with components
  rating: number
  requirements: string[]
  tips: string[]
  pitfalls: string[]
  designSpecs: DesignSpecs
  resources: ChallengeResources
}

// Simplified challenge for list views
export interface ChallengeListItem {
  id: string
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  description: string
  image?: string
  estimatedTime: string
  submissions: number
  isSaved?: boolean
}

export interface ChallengeImage {
  url: string
  alt: string
  label: string
}

export interface DesignSpecs {
  typography: Typography
  breakpoints: Record<string, string>
  colorPalette: Record<string, string>
  spacing: Record<string, string>
}

export interface Typography {
  primaryFont: string
  fallbackFonts: string
  fontSizes: Record<string, string>
  fontWeights: Record<string, string>
}

export interface ChallengeResources {
  videos: VideoResource[]
  documents: DocumentResource[]
  guides: GuideResource[]
  tools: ToolResource[]
}

export interface VideoResource {
  title: string
  duration: string
  url: string
  description: string
  thumbnail?: string
}

export interface DocumentResource {
  title: string
  type: string
  url: string
  description: string
}

export interface GuideResource {
  title: string
  url: string
  description: string
}

export interface ToolResource {
  title: string
  description: string
  url: string
  category: string
}

export interface ChallengeSubmission {
  title: string
  githubUrl: string
  liveUrl: string
  screenshot: File | null
  description: string
}

// Database types for challenges
export interface DbChallenge {
  id: string
  title: string
  difficulty: string
  tags: string[]
  description: string
  thumbnail_url?: string
  estimated_time?: string
  completions?: number
  submissions?: number
  rating?: number
  created_at?: string
}

export interface DbChallengeOverview {
  challenge_id: string
  requirements: string[]
  tips: string[]
  pitfalls: string[]
  livepreviewurl: string | null
}

export interface DbChallengeResources {
  challenge_id: string
  resources: unknown // JSONB field
}

export interface DbDesignGuidelines {
  challenge_id: string
  design_specs: unknown // JSONB field
  images: unknown // JSONB field
}

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced'
