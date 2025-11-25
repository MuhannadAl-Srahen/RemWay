# PexFect - Complete Project Documentation

A modern frontend coding challenge platform built to help developers master frontend development through hands-on practice, AI-powered feedback, and structured learning paths.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Core Modules](#core-modules)
8. [Database Schema](#database-schema)
9. [Authentication](#authentication)
10. [State Management](#state-management)
11. [Routing](#routing)
12. [Styling](#styling)
13. [API Reference](#api-reference)
14. [Configuration](#configuration)
15. [Deployment](#deployment)
16. [Contributing](#contributing)

---

## Project Overview

### What is PexFect?

PexFect is a web-based platform where developers can:

- **Practice** frontend development through curated coding challenges
- **Submit** their solutions with GitHub repositories and live URLs
- **Receive** AI-powered feedback on code quality, design accuracy, and best practices
- **Track** their progress through structured learning paths
- **Learn** from curated resources and recommendations

### Target Audience

- **Beginners** learning HTML, CSS, and JavaScript
- **Intermediate** developers mastering React and modern frameworks
- **Advanced** developers preparing for production-ready code

### Key Differentiators

| Feature               | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| **AI Feedback**       | Gemini-powered code review with specific, actionable suggestions |
| **Real Projects**     | Build actual projects, not toy examples                          |
| **Progress Tracking** | Structured learning paths with milestones                        |
| **Design-First**      | Figma designs provided for each challenge                        |
| **Resubmission**      | Improve your score based on previous feedback                    |

---

## Getting Started

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Supabase** account with a project
- **Gemini API** key (free tier available)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/MuhannadAl-Srahen/PexFect.git
cd PexFect

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI (Required for feedback)
VITE_GEMINI_API_KEY=your-gemini-api-key

# GitHub Token (Optional - increases rate limits)
VITE_GITHUB_TOKEN=your-github-pat
```

### Development

```bash
# Start development server (runs on port 5000)
bun dev

# Build for production
bun run build

# Preview production build
bun run preview

# Format code
bun run format

# Lint code
bun run lint
```

### First Run Checklist

- [ ] Supabase project created with required tables
- [ ] Environment variables configured
- [ ] Development server starts without errors
- [ ] Can sign in with GitHub OAuth
- [ ] Challenges load from database

---

## Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (React 19)                        │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Routes  │  │  Services│  │Components│  │    Providers     │ │
│  │(TanStack)│  │ (Domain) │  │(ShadCN)  │  │(Query + Theme)   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                  │           │
│       └─────────────┴─────────────┴──────────────────┘           │
│                              │                                    │
├──────────────────────────────┼────────────────────────────────────┤
│                         STATE LAYER                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  TanStack Query │  │      Zustand     │  │  React State    │  │
│  │  (Server State) │  │  (Client State)  │  │  (Local State)  │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬────────┘  │
│           │                    │                      │           │
├───────────┴────────────────────┴──────────────────────┴───────────┤
│                          API LAYER                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │    Supabase     │  │   GitHub API     │  │   Gemini AI     │  │
│  │  (DB + Auth)    │  │  (Code Fetch)    │  │  (Feedback)     │  │
│  └─────────────────┘  └──────────────────┘  └─────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component → Hook → Service API → External API/Supabase
                                       ↓
                              TanStack Query Cache
                                       ↓
                              Component Re-render
```

### Request Lifecycle Example

```
1. User clicks "Submit Solution"
2. ChallengeSubmission component handles form
3. Form validates URLs (client-side)
4. submitChallengeSolution() API called
5. Supabase stores submission
6. Navigate to /feedback/:submissionId
7. useSubmissionFeedback() hook fetches data
8. If pending → triggerFeedbackGeneration()
9. GitHub code fetched → Gemini analysis
10. Feedback stored → Poll detects completion
11. UI updates with feedback
```

---

## Features

### 1. Challenge System

Browse and complete frontend coding challenges with Figma designs.

| Feature               | Description                                |
| --------------------- | ------------------------------------------ |
| **Challenge Listing** | Grid/list view with filtering and search   |
| **Difficulty Levels** | Easy, Medium, Hard                         |
| **Categories**        | Components, Layouts, Forms, etc.           |
| **Figma Designs**     | Professional designs with view/edit access |
| **Asset Downloads**   | Starter files and assets provided          |
| **Save Challenges**   | Bookmark challenges for later              |

**Routes:**

- `/challenges` - Challenge listing page
- `/challenges/:id` - Challenge detail page

### 2. AI Feedback System

Automated code review powered by Google Gemini.

| Feature                   | Description                             |
| ------------------------- | --------------------------------------- |
| **Code Analysis**         | Reviews GitHub repository code          |
| **Design Comparison**     | Compares implementation to requirements |
| **Scoring**               | 0-100 score across 4 categories         |
| **Recommendations**       | Suggests next challenges and resources  |
| **Mismatch Detection**    | Catches wrong project submissions       |
| **Resubmission Tracking** | Compares improvements over attempts     |

**Routes:**

- `/feedback/:submissionId` - Feedback display page

**Full Documentation:** [docs/AI_FEEDBACK_SYSTEM.md](./AI_FEEDBACK_SYSTEM.md)

### 3. User Profiles

Track progress and showcase achievements.

| Feature              | Description                        |
| -------------------- | ---------------------------------- |
| **Profile Page**     | Public profile with bio and links  |
| **Statistics**       | Challenges completed, streak, rank |
| **Activity Feed**    | Recent submissions and completions |
| **Saved Challenges** | Bookmarked challenges              |
| **Social Links**     | GitHub, Twitter, LinkedIn, website |

**Routes:**

- `/profile` - Current user's profile
- `/settings` - Profile settings

### 4. Learning Paths (Roadmap)

Structured progression from beginner to advanced.

| Path             | Duration   | Technologies                          |
| ---------------- | ---------- | ------------------------------------- |
| **Beginner**     | 4-6 weeks  | HTML, CSS, JavaScript                 |
| **Intermediate** | 6-8 weeks  | React, APIs, State Management         |
| **Advanced**     | 8-10 weeks | TypeScript, Performance, Architecture |

**Routes:**

- `/roadmap` - Learning paths overview
- `/roadmap/:pathId` - Path detail with challenges

### 5. Resources

Curated learning materials and documentation.

| Category          | Examples                        |
| ----------------- | ------------------------------- |
| **Documentation** | MDN, React Docs                 |
| **Tutorials**     | CSS Tricks, JavaScript.info     |
| **Tools**         | VS Code, Figma, Chrome DevTools |
| **Communities**   | Discord, Reddit, Stack Overflow |

**Routes:**

- `/resources` - Resource library

### 6. Progress Tracking

Monitor your learning journey.

| Feature              | Description                         |
| -------------------- | ----------------------------------- |
| **Challenge Status** | Not Started, In Progress, Completed |
| **Completion Rate**  | Percentage of path completed        |
| **Time Tracking**    | Estimated vs actual time            |
| **Streak System**    | Daily engagement tracking           |

**Routes:**

- `/progress` - Progress dashboard

---

## Tech Stack

### Frontend Framework

| Technology     | Version | Purpose                                   |
| -------------- | ------- | ----------------------------------------- |
| **React**      | 19.2.0  | UI framework with automatic JSX transform |
| **TypeScript** | 5.9.3   | Type safety with strict mode              |
| **Vite**       | 7.2.4   | Build tool with HMR                       |

### Routing & State

| Technology          | Version | Purpose                                |
| ------------------- | ------- | -------------------------------------- |
| **TanStack Router** | 1.139.3 | File-based routing with code-splitting |
| **TanStack Query**  | 5.90.10 | Server state management                |
| **TanStack Form**   | 1.25.0  | Form handling with validation          |
| **Zustand**         | 5.0.8   | Client state management                |

### UI & Styling

| Technology       | Version  | Purpose                                 |
| ---------------- | -------- | --------------------------------------- |
| **Tailwind CSS** | 4.1.17   | Utility-first styling (via Vite plugin) |
| **ShadCN UI**    | 0.9.5    | Radix-based component library           |
| **Radix UI**     | Various  | Accessible primitives                   |
| **Lucide React** | 0.539.0  | Icon library                            |
| **Motion**       | 12.23.24 | Animation library                       |

### Backend & APIs

| Technology     | Version | Purpose                 |
| -------------- | ------- | ----------------------- |
| **Supabase**   | 2.84.0  | Database, Auth, Storage |
| **Gemini AI**  | 0.24.1  | AI feedback generation  |
| **GitHub API** | REST v3 | Code fetching           |

### Development Tools

| Technology            | Version | Purpose                     |
| --------------------- | ------- | --------------------------- |
| **ESLint**            | 9.39.1  | Code linting                |
| **Prettier**          | 3.6.2   | Code formatting             |
| **TypeScript ESLint** | 8.47.0  | TypeScript-specific linting |

---

## Project Structure

```
pexfect/
├── public/                    # Static assets
├── docs/                      # Documentation
│   ├── AI_FEEDBACK_SYSTEM.md  # AI system documentation
│   └── PROJECT_DOCUMENTATION.md # This file
├── scripts/                   # Utility scripts
│   ├── debug-feedback.ts      # Debug tool for feedback
│   └── manual-feedback.ts     # Manual feedback generation
├── src/
│   ├── assets/               # Images, icons, fonts
│   │   ├── icons/
│   │   └── images/
│   ├── components/           # Shared UI components
│   │   └── ui/              # ShadCN components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── skeleton.tsx
│   │       └── ...
│   ├── layouts/             # Page layouts
│   │   ├── MainLayout.tsx   # Primary app layout
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── Footer.tsx       # Site footer
│   │   ├── PageLayout.tsx   # Standard page wrapper
│   │   └── navbar/          # Navbar sub-components
│   ├── lib/                 # Utilities and config
│   │   ├── supabaseClient.ts
│   │   ├── queryClient.ts
│   │   ├── queryConfig.ts
│   │   ├── authSubscription.ts
│   │   └── utils.ts
│   ├── providers/           # React context providers
│   │   └── AppProvider.tsx  # Query + Theme providers
│   ├── routes/              # TanStack Router pages
│   │   ├── __root.tsx       # Root layout
│   │   ├── index.tsx        # Home page
│   │   ├── profile.tsx
│   │   ├── progress.tsx
│   │   ├── challenges/
│   │   │   ├── index.tsx    # Challenge list
│   │   │   └── $id/
│   │   │       └── index.tsx # Challenge detail
│   │   ├── feedback/
│   │   │   └── $submissionId.tsx
│   │   ├── resources/
│   │   ├── roadmap/
│   │   └── settings/
│   ├── services/            # Feature modules
│   │   ├── ai/              # AI feedback service
│   │   ├── challenges/      # Challenge features
│   │   ├── feedback/        # Feedback display
│   │   ├── home/            # Landing page
│   │   ├── profile/         # User profiles
│   │   ├── resources/       # Learning resources
│   │   └── roadmap/         # Learning paths
│   ├── styles/              # CSS files
│   │   └── profile.css
│   ├── types/               # TypeScript definitions
│   │   ├── challenge.ts
│   │   ├── profile.ts
│   │   ├── feedback.ts
│   │   ├── roadmap.ts
│   │   └── supabase.ts
│   ├── main.tsx             # App entry point
│   ├── index.css            # Global styles + Tailwind
│   └── routeTree.gen.ts     # Auto-generated routes
├── .env.local               # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Service Module Pattern

Each service follows a consistent structure:

```
services/[feature]/
├── api.ts              # Supabase queries and mutations
├── index.ts            # Public exports
├── components/         # Feature-specific components
│   ├── ComponentA.tsx
│   └── ComponentB.tsx
├── hooks/              # Custom React hooks
│   └── useFeature.ts
├── lib/                # Helper utilities
└── utils/              # Pure utility functions
```

**Import Rule:** Always import from service index:

```typescript
// ✅ Correct
import { ChallengeGridItem, useChallenges } from '@/services/challenges'

// ❌ Avoid deep imports
import { ChallengeGridItem } from '@/services/challenges/components/ChallengeGridItem'
```

---

## Core Modules

### Challenges Service

**Location:** `src/services/challenges/`

**Components:**

- `ChallengePageHeader` - Page title and controls
- `ChallengeControls` - Filter/search/view toggle
- `ChallengeGridItem` - Grid view card
- `ChallengeListItem` - List view row
- `ChallengeView` - Container with view switching
- `ChallengeHero` - Detail page header
- `ChallengeOverview` - Requirements and outcomes
- `ChallengeDesign` - Figma embed and preview
- `ChallengeResources` - Assets and downloads
- `ChallengeSubmission` - Submission form

**Hooks:**

- `useChallenges()` - Fetch all challenges
- `useChallengeFilters()` - Filter state management
- `useSubmissionForm()` - Form handling
- `useAuth()` - Authentication state
- `useSavedChallenges()` - Bookmark management
- `useToggleSave()` - Toggle bookmark mutation

**API Functions:**

- `getChallengeById(id)` - Get single challenge
- `submitChallengeSolution(id, data)` - Submit solution

### Feedback Service

**Location:** `src/services/feedback/`

**Components:**

- `FeedbackHeader` - Score and summary
- `FeedbackLoading` - Loading skeleton
- `FeedbackProcessing` - Generation in progress
- `FeedbackError` - Error state with retry
- `OverallAnalysis` - What you did well/improve
- `DesignComparison` - Design vs implementation
- `TechAnalysis` - Category breakdown
- `Recommendations` - Next steps
- `MismatchWarning` - Wrong project banner
- `ImprovementsFromPrevious` - Resubmission tracking

**Hooks:**

- `useSubmissionFeedback(id)` - Fetch feedback data

**API Functions:**

- `getSubmissionFeedback(id)` - Get feedback + submission + challenge
- `triggerFeedbackGeneration(id)` - Start AI analysis
- `generateAndStoreFeedback(id)` - Full generation flow

### AI Service

**Location:** `src/services/ai/`

**Modules:**

- `api.ts` - Gemini AI integration
- `githubFetcher.ts` - GitHub code fetching
- `validation.ts` - URL validation utilities

**Key Functions:**

- `generateAIFeedback(request)` - Generate AI feedback
- `fetchRepositoryCode(url)` - Fetch GitHub files
- `formatCodeForAI(code)` - Format for prompt
- `isValidGitHubUrl(url)` - Validate GitHub URL
- `isValidLiveSiteUrl(url)` - Validate live URL

### Profile Service

**Location:** `src/services/profile/`

**Components:**

- Profile display components
- Activity feed
- Statistics cards

**Hooks:**

- `useProfile()` - Fetch user profile
- `useUpdateProfile()` - Update profile mutation

**API Functions:**

- `ProfileService.getProfile(userId)`
- `ProfileService.updateProfile(userId, data)`
- `ProfileService.getStats(userId)`

### Home Service

**Location:** `src/services/home/`

**Components:**

- `HeroSection` - Landing hero with CTA
- `FeatureSection` - Feature highlights
- `HowWorkSection` - How it works steps
- `ChallengeSection` - Featured challenges
- `CIASection` - Call to action

### Resources Service

**Location:** `src/services/resources/`

**Components:**

- `ResourceGrid` - Resource cards grid
- `ResourceCard` - Individual resource card
- `ResourcesSection` - Section wrapper
- `ResourceControls` - Filter controls

**Hooks:**

- `useResourceManagement()` - Resource state and filtering

### Roadmap Service

**Location:** `src/services/roadmap/`

**Data:**

- `learningPaths` - Beginner, Intermediate, Advanced paths

---

## Database Schema

### Core Tables

#### `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  github_username TEXT,
  twitter_username TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `challenges`

```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  design_url TEXT NOT NULL,
  figma_access_type TEXT CHECK (figma_access_type IN ('view', 'edit')),
  assets_url TEXT,
  estimated_time INTEGER,
  learning_outcomes TEXT[],
  preview_image TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `challenge_submissions`

```sql
CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  challenge_id UUID REFERENCES challenges(id),
  github_url TEXT NOT NULL,
  live_site_url TEXT,
  screenshots TEXT[],
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `challenge_feedback`

```sql
CREATE TABLE challenge_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES challenge_submissions(id),
  overall_score INTEGER,
  overall_rating TEXT,
  overall_good_practices TEXT[],
  improvment_advices TEXT[],
  best_practices JSONB,
  code_formatting JSONB,
  functionality JSONB,
  accessibility JSONB,
  recommended_resources JSONB,
  recommended_next_challenge TEXT,
  overall_analysis_description JSONB,
  comparison_notes JSONB,
  improvements_from_previous JSONB,
  submission_mismatch JSONB,
  ai_model_version TEXT,
  feedback_generation_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `saved_challenges`

```sql
CREATE TABLE saved_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  challenge_id UUID REFERENCES challenges(id),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, challenge_id)
);
```

#### `resources`

```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

```sql
-- Example: Users can only read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Example: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

---

## Authentication

### Provider

PexFect uses **Supabase Auth** with GitHub OAuth as the primary sign-in method.

### Flow

```
1. User clicks "Sign In with GitHub"
2. Supabase redirects to GitHub OAuth
3. User authorizes the app
4. GitHub redirects back with auth code
5. Supabase exchanges code for session
6. User profile created/updated in profiles table
7. Session stored in localStorage
```

### Implementation

**Auth Subscription:** `src/lib/authSubscription.ts`

A single global auth listener is initialized in `AppProvider` to:

- Detect sign-in/sign-out events
- Invalidate relevant queries on logout
- Sync auth state across tabs

**Auth Hook:** `src/services/challenges/hooks/useAuth.ts`

```typescript
const { data, isLoading } = useAuth()
// data.isAuthenticated - boolean
// data.user - User object or null
```

### Protected Routes

Components check authentication and show appropriate UI:

```typescript
const { isAuthenticated, isLoading } = useAuth()

if (isLoading) return <Skeleton />
if (!isAuthenticated) return <SignInPrompt />
return <AuthenticatedContent />
```

---

## State Management

### Server State (TanStack Query)

For all data fetched from APIs:

```typescript
// Query hook example
export const useChallenges = () => {
  return useQuery({
    queryKey: queryKeys.challenges,
    queryFn: getChallenges,
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_VALIDITY.MEDIUM,
  })
}
```

**Configuration:** `src/lib/queryConfig.ts`

| Constant         | Values                               | Use Case                  |
| ---------------- | ------------------------------------ | ------------------------- |
| `STALE_TIME`     | SHORT (30s), MEDIUM (5m), LONG (30m) | How long data is "fresh"  |
| `CACHE_VALIDITY` | SHORT (5m), MEDIUM (30m), LONG (24h) | How long to keep in cache |
| `queryKeys`      | Factory functions                    | Consistent cache keys     |

### Client State (Zustand)

For UI state that doesn't come from the server:

```typescript
// Filter state example
const useFilterStore = create((set) => ({
  difficulty: [],
  category: [],
  setDifficulty: (d) => set({ difficulty: d }),
}))
```

### Local State (useState)

For component-specific state:

```typescript
const [isOpen, setIsOpen] = useState(false)
const [searchTerm, setSearchTerm] = useState('')
```

---

## Routing

### TanStack Router

File-based routing with automatic code-splitting:

```
routes/
├── __root.tsx           → Layout wrapper
├── index.tsx            → /
├── profile.tsx          → /profile
├── progress.tsx         → /progress
├── challenges/
│   ├── index.tsx        → /challenges
│   └── $id/
│       └── index.tsx    → /challenges/:id
├── feedback/
│   └── $submissionId.tsx → /feedback/:submissionId
├── resources/
│   └── index.tsx        → /resources
├── roadmap/
│   ├── index.tsx        → /roadmap
│   └── $pathId/
│       └── index.tsx    → /roadmap/:pathId
└── settings/
    └── index.tsx        → /settings
```

### Route Definition

```typescript
// routes/challenges/$id/index.tsx
export const Route = createFileRoute('/challenges/$id/')({
  component: ChallengeDetailPage,
})

function ChallengeDetailPage() {
  const { id } = Route.useParams() // Type-safe params
  // ...
}
```

### Navigation

```typescript
import { useNavigate, Link } from '@tanstack/react-router'

// Programmatic navigation
const navigate = useNavigate()
navigate({ to: '/challenges/$id', params: { id: '123' } })

// Link component
<Link to="/challenges/$id" params={{ id: '123' }}>
  View Challenge
</Link>
```

---

## Styling

### Tailwind CSS v4

Configured via Vite plugin (no tailwind.config.js):

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

### Global Styles

`src/index.css` contains:

- Tailwind imports
- CSS custom properties for theming
- Base styles

### Theme System

Using `next-themes` for dark mode:

```typescript
// Toggle theme
const { theme, setTheme } = useTheme()
setTheme('dark') // or 'light' or 'system'
```

### Component Styling

Use Tailwind utilities:

```tsx
<div className='bg-card text-card-foreground rounded-xl border shadow-sm p-6'>
  <h2 className='text-lg font-bold text-foreground'>Title</h2>
  <p className='text-sm text-muted-foreground'>Description</p>
</div>
```

### Responsive Design

Mobile-first with breakpoints:

```tsx
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
  {/* Cards */}
</div>
```

---

## API Reference

### Supabase Client

**Location:** `src/lib/supabaseClient.ts`

```typescript
import { supabase } from '@/lib/supabaseClient'

// Query data
const { data, error } = await supabase
  .from('challenges')
  .select('*')
  .eq('difficulty', 'easy')

// Insert data
const { data, error } = await supabase
  .from('challenge_submissions')
  .insert({ ... })
  .select()
  .single()
```

### Query Client

**Location:** `src/lib/queryClient.ts`

Custom configuration for:

- Retry logic (skip auth errors)
- Network mode
- Error handling

### Service APIs

Each service exposes functions in `api.ts`:

```typescript
// challenges/api.ts
export const getChallenges = async (): Promise<Challenge[]>
export const getChallengeById = async (id: string): Promise<Challenge | null>
export const submitChallengeSolution = async (id: string, data: SubmissionData): Promise<{ submissionId: string }>

// feedback/api.ts
export const getSubmissionFeedback = async (id: string): Promise<FeedbackResponse>
export const triggerFeedbackGeneration = async (id: string): Promise<void>
export const generateAndStoreFeedback = async (id: string): Promise<void>

// profile/api.ts
export const ProfileService = {
  getProfile: async (userId: string): Promise<Profile>,
  updateProfile: async (userId: string, data: ProfileUpdate): Promise<Profile>,
  getStats: async (userId: string): Promise<ProfileStats>,
}
```

---

## Configuration

### Vite Configuration

`vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5000 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'tanstack-vendor': [
            '@tanstack/react-query',
            '@tanstack/react-router',
          ],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['@radix-ui/...'],
        },
      },
    },
  },
})
```

### TypeScript Configuration

`tsconfig.json`:

- Strict mode enabled
- Path aliases configured
- ES2022 target

### ESLint Configuration

`eslint.config.js`:

- TypeScript ESLint rules
- React hooks rules
- TanStack Query rules
- Prettier integration

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main

**Build Settings:**

- Framework: Vite
- Build Command: `bun run build`
- Output Directory: `dist`

### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_GEMINI_API_KEY=your-production-gemini-key
VITE_GITHUB_TOKEN=your-github-pat
```

### Supabase Setup

1. Create production Supabase project
2. Run database migrations
3. Configure RLS policies
4. Set up GitHub OAuth in Supabase Auth settings
5. Update redirect URLs for production domain

---

## Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/pf-XX-description`
2. Make changes following code patterns
3. Run linter: `bun run lint`
4. Format code: `bun run format`
5. Build: `bun run build`
6. Create pull request

### Commit Convention

```
type(scope): description

Types: feat, fix, refactor, docs, style, test, chore
Scope: challenges, feedback, profile, auth, ui, etc.
```

**Examples:**

```
feat(challenges): add filter by category
fix(feedback): resolve cache invalidation issue
docs: update API reference
```

### Code Standards

- TypeScript strict mode (no `any`)
- Import from service index, not deep paths
- Use query keys from `queryConfig.ts`
- Follow existing component patterns
- Add loading and error states
- Consider mobile-first design

### Pull Request Checklist

- [ ] Code follows project patterns
- [ ] TypeScript types properly defined
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Responsive design works
- [ ] Build passes without errors

---

## Additional Documentation

- [AI Feedback System](./AI_FEEDBACK_SYSTEM.md) - Complete AI system documentation
- [README.md](../README.md) - Quick start guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines

---

_Last updated: November 2025_
