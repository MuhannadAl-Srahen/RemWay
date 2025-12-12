export type RoadmapDifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface LearningPath {
  id: RoadmapDifficultyLevel
  title: string
  description: string
  difficulty: RoadmapDifficultyLevel
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
