// ============================================================================
// ROADMAP TYPES
// ============================================================================

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface LearningPath {
  id: DifficultyLevel
  title: string
  description: string
  difficulty: DifficultyLevel
  duration: string
  completedChallenges: number
  progressPercentage: number
  technologies: string[]
  estimatedWeeks: number
  milestones: Array<{
    id: string
    title: string
    description?: string
    completed?: boolean
  }>
}

export interface RoadmapNode {
  id: string
  title: string
  description: string
  type: NodeType
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  prerequisites: string[]
  resources: string[]
  status: NodeStatus
  position: { x: number; y: number }
  connections: string[]
}

export type NodeType = 'concept' | 'skill' | 'project' | 'milestone'
export type NodeStatus = 'locked' | 'available' | 'in-progress' | 'completed'

export interface Roadmap {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  nodes: RoadmapNode[]
  tags: string[]
}
