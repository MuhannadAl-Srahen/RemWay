// ============================================================================
// RESOURCE TYPES
// ============================================================================

export interface Resource {
  id: string
  title: string
  description: string
  type: ResourceType
  category: string
  url: string
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  tags?: string[]
  thumbnail?: string
  duration?: string
  author?: string
  /** For video resources - YouTube channel name */
  channel?: string
  publishedAt?: string
  rating?: number
  views?: number
  free?: boolean
  color?: string // For styling
  users?: string // For tools - number of users
  by?: string // Alias for author/channel for backward compatibility
}

export type ResourceType =
  | 'article'
  | 'video'
  | 'course'
  | 'documentation'
  | 'tool'
  | 'template'

// Interface for component resource items (simplified version of Resource)
export interface ResourceItem {
  title: string
  description: string
  category: string
  url: string
  rating?: number
  free?: boolean
  image?: string
  color?: string
  users?: string
  by?: string
  channel?: string
  duration?: string
  thumbnail?: string
}
