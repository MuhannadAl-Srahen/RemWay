import type { LearningPath } from '../../types/roadmap'

export const learningPaths: LearningPath[] = [
  {
    id: 'beginner',
    title: 'Beginner Path',
    description:
      'Perfect for complete beginners. Learn HTML, CSS, and basic JavaScript through fun, hands-on projects.',
    difficulty: 'beginner',
    duration: '2-3 weeks',
    completedChallenges: 0,
    progressPercentage: 0,
    technologies: ['HTML', 'CSS', 'JavaScript'],
    estimatedWeeks: 3,
    milestones: [],
  },
  {
    id: 'intermediate',
    title: 'Intermediate Path',
    description:
      'Ready for React and modern development? Build dynamic applications with APIs and state management.',
    difficulty: 'intermediate',
    duration: '2-4 weeks',
    completedChallenges: 0,
    progressPercentage: 0,
    technologies: ['React', 'APIs', 'State Management', 'Testing'],
    estimatedWeeks: 4,
    milestones: [],
  },
  {
    id: 'advanced',
    title: 'Advanced Path',
    description:
      'Enterprise-level challenges with TypeScript, testing, and advanced patterns for production-ready code.',
    difficulty: 'advanced',
    duration: '3-5 weeks',
    completedChallenges: 0,
    progressPercentage: 0,
    technologies: ['TypeScript', 'Performance', 'Architecture', 'Deployment'],
    estimatedWeeks: 5,
    milestones: [],
  },
]
