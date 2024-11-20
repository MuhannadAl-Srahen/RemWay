// ============================================================================
// RE-EXPORT ALL TYPES FROM ORGANIZED FILES
// ============================================================================

// Challenge types
export type {
  Challenge,
  ChallengeListItem,
  ChallengeImage,
  DesignSpecs,
  Typography,
  ChallengeResources,
  VideoResource,
  DocumentResource,
  GuideResource,
  ToolResource,
  ChallengeSubmission,
  DbChallenge,
  DbChallengeOverview,
  DbChallengeResources,
  DbDesignGuidelines,
  DifficultyLevel,
} from './challenge'

// Profile types
export type {
  UserProfile,
  ProfileStats,
  ExperienceLevel,
  UserData,
  DbProfile,
  SavedChallenge,
  Submission,
} from './profile'

// Resource types
export type { Resource, ResourceType, ResourceItem } from './resource'

// Auth types
export type {
  User,
  AuthState,
  LoginCredentials,
  SignupCredentials,
} from './auth'

// Roadmap types
export type {
  RoadmapNode,
  NodeType,
  NodeStatus,
  Roadmap,
  DifficultyLevel as RoadmapDifficultyLevel,
  LearningPath,
} from './roadmap'

// Feedback types
export type {
  Feedback,
  FeedbackStatus,
  SubmissionFeedback,
  FeedbackComment,
} from './feedback'

// Component props types
export type {
  ChallengeItemProps,
  ChallengeControlsProps,
  ChallengeViewProps,
  ChallengeFiltersProps,
  ResourceGridProps,
  ResourceControlsProps,
} from './components'

// Supabase helper types
export type {
  SupabaseTable,
  SupabaseQuery,
  SupabaseRPC,
  DbChallengeSubmission,
} from './supabase'
