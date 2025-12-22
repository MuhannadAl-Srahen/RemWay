import type { Challenge } from '@/types/challenge'
import type { UserProfile } from '@/types/profile'
import type { AIFeedbackResponse } from '@/services/ai/api'

/**
 * Mock challenge data for testing
 */
export const mockChallenge: Challenge = {
  id: 'test-challenge-1',
  title: 'Test Challenge',
  description: 'A test challenge description',
  difficulty: 'easy',
  category: 'components',
  tags: ['react', 'typescript'],
  design_url: 'https://figma.com/test',
  figma_access_type: 'view',
  assets_url: 'https://github.com/test/assets',
  estimated_time: 2,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  learning_outcomes: ['Learn React components', 'Practice TypeScript'],
  preview_image: 'https://example.com/preview.png',
}

export const mockChallenges: Challenge[] = [
  mockChallenge,
  {
    ...mockChallenge,
    id: 'test-challenge-2',
    title: 'Advanced Challenge',
    difficulty: 'hard',
    category: 'layouts',
  },
  {
    ...mockChallenge,
    id: 'test-challenge-3',
    title: 'Intermediate Challenge',
    difficulty: 'medium',
    category: 'forms',
  },
]

/**
 * Mock user profile data
 */
export const mockUserProfile: UserProfile = {
  id: 'test-user-id',
  user_id: 'auth-user-id',
  username: 'testuser',
  full_name: 'Test User',
  avatar_url: 'https://github.com/testuser.png',
  bio: 'Test user bio',
  location: 'Test City',
  website: 'https://testuser.com',
  github_username: 'testuser',
  twitter_username: 'testuser',
  linkedin_url: 'https://linkedin.com/in/testuser',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

/**
 * Mock submission data
 */
export const mockSubmission = {
  id: 'test-submission-1',
  profile_id: 'test-user-id',
  challenge_id: 'test-challenge-1',
  challenge_title: 'Test Challenge',
  github_url: 'https://github.com/testuser/test-repo',
  live_site_url: 'https://test-site.vercel.app',
  screenshots: [],
  submission_description: 'My test submission',
  submitted_at: '2026-01-07T00:00:00Z',
  previous_submission_id: null,
}

/**
 * Mock AI feedback data
 */
export const mockAIFeedback: AIFeedbackResponse = {
  overallScore: 85,
  scoreBreakdown: {
    design: 25,
    codeQuality: 26,
    functionality: 22,
    accessibility: 12,
  },
  overallRating: 'good',
  whatYouDidWell: [
    'Clean component structure',
    'Proper TypeScript usage',
    'Good responsive design',
  ],
  areasForImprovement: [
    'Add error boundaries',
    'Improve accessibility',
    'Optimize bundle size',
  ],
  designComparison: {
    matchesDesign: true,
    designNotes: ['Colors match the design', 'Layout is pixel-perfect'],
  },
  techAnalysis: {
    bestPractices: [
      {
        category: 'Code Organization',
        description: 'Components are well organized',
        status: 'good',
      },
    ],
    codeFormatting: [
      {
        category: 'Naming Conventions',
        description: 'Consistent naming',
        status: 'good',
      },
    ],
    functionality: [
      {
        category: 'Features',
        description: 'All features work correctly',
        status: 'good',
      },
    ],
    accessibility: [
      {
        category: 'Semantic HTML',
        description: 'Using semantic HTML elements',
        status: 'good',
      },
    ],
  },
  recommendations: {
    nextChallenges: [
      {
        id: 'next-challenge-1',
        title: 'Next Challenge',
        difficulty: 'intermediate',
      },
    ],
    learningResources: [
      {
        title: 'React Documentation',
        url: 'https://react.dev',
        type: 'docs',
      },
    ],
  },
}
