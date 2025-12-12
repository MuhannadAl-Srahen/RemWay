export type ResourceCategory =
  | 'Documentation'
  | 'Tutorial'
  | 'Video'
  | 'Article'
  | 'Tool'
  | 'Library'
  | 'Course'
  | 'Book'
  | 'Podcast'
  | 'Newsletter'

export type ResourceDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'all'

export interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: ResourceCategory
  difficulty: ResourceDifficulty
  tags: string[]
  author?: string
  thumbnail_url?: string
  is_free: boolean
  rating?: number
  created_at: string
  updated_at: string
}

export interface ResourceFilters {
  category?: ResourceCategory[]
  difficulty?: ResourceDifficulty[]
  tags?: string[]
  isFree?: boolean
  search?: string
}

export interface ResourceStats {
  total_resources: number
  resources_by_category: Record<ResourceCategory, number>
  resources_by_difficulty: Record<ResourceDifficulty, number>
  average_rating: number
}

// Database types
export interface DbResource {
  id: string
  title: string
  description: string
  url: string
  category: ResourceCategory
  difficulty: ResourceDifficulty
  tags: string[]
  author: string | null
  thumbnail_url: string | null
  is_free: boolean
  rating: number | null
  created_at: string
  updated_at: string
}
