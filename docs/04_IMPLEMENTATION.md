# PexFect - Implementation Details

## Document Information

| Field             | Value                |
| ----------------- | -------------------- |
| **Project Name**  | PexFect              |
| **Version**       | 1.0.0                |
| **Document Type** | Implementation Guide |
| **Last Updated**  | January 2026         |

---

## 1. Project Structure

### 1.1 Directory Layout

```
pexfect/
├── docs/                      # Documentation files
│   ├── 01_INTRODUCTION.md
│   ├── 02_SYSTEM_ANALYSIS.md
│   ├── 03_DESIGN.md
│   ├── 04_IMPLEMENTATION.md   # This file
│   ├── 05_TESTING_VALIDATION.md
│   ├── 06_RESULTS_DISCUSSION.md
│   └── 07_CODE_OVERVIEW.md
│
├── public/                    # Static assets (served as-is)
│
├── scripts/                   # Development/debug scripts
│   ├── debug-feedback.ts
│   ├── manual-feedback.ts
│   └── test-ai-consistency.ts
│
├── src/                       # Source code
│   ├── assets/               # Images, icons, fonts
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── components/           # Shared UI components
│   │   └── ui/               # ShadCN/Radix primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ...
│   │
│   ├── layouts/              # Page layouts
│   │   ├── MainLayout.tsx    # Primary app layout
│   │   ├── Navbar.tsx        # Navigation header
│   │   ├── Footer.tsx        # Page footer
│   │   ├── PageLayout.tsx    # Content wrapper
│   │   └── navbar/           # Navbar sub-components
│   │
│   ├── lib/                  # Core utilities
│   │   ├── supabaseClient.ts # Supabase initialization
│   │   ├── queryClient.ts    # TanStack Query setup
│   │   ├── queryConfig.ts    # Query keys & timing
│   │   ├── authSubscription.ts # Auth state listener
│   │   └── utils.ts          # Helper functions
│   │
│   ├── providers/            # React context providers
│   │   ├── AppProvider.tsx   # Root provider
│   │   └── index.ts
│   │
│   ├── routes/               # TanStack Router pages
│   │   ├── __root.tsx        # Root layout
│   │   ├── index.tsx         # Home page
│   │   ├── challenges/       # Challenge routes
│   │   ├── feedback/         # Feedback routes
│   │   ├── roadmap/          # Learning path routes
│   │   └── ...
│   │
│   ├── services/             # Feature modules
│   │   ├── ai/               # AI feedback service
│   │   ├── challenges/       # Challenge management
│   │   ├── feedback/         # Feedback display
│   │   ├── home/             # Landing page
│   │   ├── profile/          # User profile
│   │   ├── resources/        # Learning resources
│   │   └── roadmap/          # Learning paths
│   │
│   ├── styles/               # Feature-specific CSS
│   │   └── profile.css
│   │
│   ├── types/                # TypeScript definitions
│   │   ├── challenge.ts
│   │   ├── feedback.ts
│   │   ├── profile.ts
│   │   ├── supabase.ts
│   │   └── index.ts
│   │
│   ├── index.css             # Global styles & theme
│   ├── main.tsx              # Application entry point
│   ├── routeTree.gen.ts      # Auto-generated routes
│   └── vite-env.d.ts         # Vite type declarations
│
├── .env.example              # Environment template
├── .env.local                # Local environment (gitignored)
├── components.json           # ShadCN configuration
├── eslint.config.js          # ESLint configuration
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── vercel.json               # Deployment configuration
```

---

## 2. Core Implementations

### 2.1 Application Entry Point

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './index.css'

// Create router with generated route tree
const router = createRouter({ routeTree })

// Type-safe router declaration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
```

### 2.2 Root Layout

```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { MainLayout } from '@/layouts/MainLayout'
import { AppProvider } from '@/providers/AppProvider'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <AppProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </AppProvider>
  )
}
```

### 2.3 App Provider Setup

```typescript
// src/providers/AppProvider.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { queryClient } from '@/lib/queryClient'

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

---

## 3. Service Module Implementation

### 3.1 Challenges Service

#### API Layer (api.ts)

```typescript
// src/services/challenges/api.ts
import { supabase } from '@/lib/supabaseClient'
import type { Challenge } from '@/types'

// Fetch single challenge by ID
export const getChallengeById = async (id: string): Promise<Challenge | null> => {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      challenge_overview(*),
      challenge_requirements(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Submit a challenge solution
export const submitChallengeSolution = async (
  challengeId: string,
  submission: SubmissionData
) => {
  // 1. Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // 2. Verify GitHub ownership
  const userGithubUsername = user.user_metadata?.user_name?.toLowerCase()
  const repoOwner = extractGitHubOwner(submission.githubUrl)

  if (repoOwner !== userGithubUsername) {
    throw new Error('GITHUB_OWNERSHIP_ERROR: Repository belongs to another user')
  }

  // 3. Insert submission
  const { data, error } = await supabase
    .from('challenge_submissions')
    .insert({
      profile_id: user.id,
      challenge_id: challengeId,
      github_url: submission.githubUrl,
      live_site_url: submission.liveUrl,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

#### Hooks Layer (hooks/)

```typescript
// src/services/challenges/hooks/useChallenge.ts
import { useQuery } from '@tanstack/react-query'
import { queryKeys, STALE_TIME, CACHE_VALIDITY } from '@/lib/queryConfig'
import { getChallengeById } from '../api'

export const useChallenge = (id: string) => {
  return useQuery({
    queryKey: queryKeys.challengeDetail(id),
    queryFn: () => getChallengeById(id),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_VALIDITY.MEDIUM,
    enabled: !!id, // Only run if ID exists
  })
}
```

#### Public Exports (index.ts)

```typescript
// src/services/challenges/index.ts
// API functions
export { getChallengeById, getChallenges, submitChallengeSolution } from './api'

// Hooks
export { useChallenge } from './hooks/useChallenge'
export { useChallenges } from './hooks/useChallenges'

// Components
export { ChallengeCard } from './components/ChallengeCard'
export { ChallengeGrid } from './components/ChallengeGrid'
export { ChallengeFilters } from './components/ChallengeFilters'
```

---

### 3.2 AI Feedback Service

#### Main API (api.ts)

```typescript
// src/services/ai/api.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { fetchRepositoryCode, formatCodeForAI } from './githubFetcher'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export async function generateAIFeedback(
  request: AIFeedbackRequest
): Promise<AIFeedbackResponse> {
  // 1. Fetch source code from GitHub
  const { code, status } = await fetchRepositoryCode(
    request.submission.github_url
  )

  // 2. Build the AI prompt
  const prompt = buildFeedbackPrompt({
    code: formatCodeForAI(code),
    challengeDescription: request.challengeDescription,
    designRequirements: request.designRequirements,
    previousFeedback: request.previousFeedback,
  })

  // 3. Call Gemini API with deterministic settings
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-pro',
    generationConfig: {
      temperature: 0,      // No randomness
      topK: 1,             // Most likely token
      topP: 1,             // No nucleus sampling
      responseMimeType: 'application/json',
    },
  })

  const result = await model.generateContent(prompt)
  const response = JSON.parse(result.response.text())

  return response
}
```

#### GitHub Code Fetcher

```typescript
// src/services/ai/githubFetcher.ts

// Priority order for file fetching
const FILE_PRIORITY = [
  'src/',           // Source directory (highest)
  'components/',
  'pages/',
  'app/',
  'lib/',
  'styles/',
  'index.html',
  'package.json',   // Config files (lowest)
]

export async function fetchRepositoryCode(githubUrl: string) {
  const { owner, repo } = parseGitHubUrl(githubUrl)

  // 1. Fetch repository tree
  const treeResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`
  )
  const tree = await treeResponse.json()

  // 2. Filter and prioritize files
  const files = tree.tree
    .filter((f: any) => isCodeFile(f.path))
    .sort((a: any, b: any) => getPriority(a.path) - getPriority(b.path))
    .slice(0, 20) // Limit to 20 files

  // 3. Fetch file contents in parallel
  const contents = await Promise.all(
    files.map((f: any) => fetchFileContent(owner, repo, f.path))
  )

  return {
    code: contents.join('\n\n'),
    status: { success: true, filesCount: files.length }
  }
}
```

#### URL Validation

```typescript
// src/services/ai/validation.ts

export function isValidGitHubUrl(url: string): boolean {
  const pattern = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/
  return pattern.test(url)
}

export function isValidLiveSiteUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Must be HTTPS and not localhost
    return (
      parsed.protocol === 'https:' &&
      !parsed.hostname.includes('localhost') &&
      !parsed.hostname.includes('127.0.0.1')
    )
  } catch {
    return false
  }
}

export async function checkLiveSiteAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' })
    return true // If no error, consider accessible
  } catch {
    return false
  }
}
```

---

## 4. Database Integration

### 4.1 Supabase Client Setup

```typescript
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 4.2 Type-Safe Queries

```typescript
// Using types from src/types/supabase.ts
import type { SupabaseTable, SupabaseQueryBuilder } from '@/types/supabase'

// Type-safe query with casting
const { data, error } = await (supabase
  .from('challenges')
  .select('*')
  .order('created_at', { ascending: false }) as SupabaseQueryBuilder)
```

### 4.3 Authentication Pattern

```typescript
// Always verify auth before protected operations
export async function protectedOperation() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('User not authenticated')
  }

  // Proceed with user-specific operation
  return doSomething(user.id)
}
```

---

## 5. Routing Implementation

### 5.1 File-Based Route Structure

```typescript
// src/routes/challenges/index.tsx - Challenges list page
import { createFileRoute } from '@tanstack/react-router'
import { ChallengesPage } from '@/services/challenges/components/ChallengesPage'

export const Route = createFileRoute('/challenges/')({
  component: ChallengesPage,
})
```

```typescript
// src/routes/challenges/$id/index.tsx - Challenge detail page
import { createFileRoute } from '@tanstack/react-router'
import { ChallengeDetailPage } from '@/services/challenges/components/ChallengeDetailPage'

export const Route = createFileRoute('/challenges/$id/')({
  component: ChallengeDetailPage,
})

function ChallengeDetailPage() {
  const { id } = Route.useParams() // Type-safe param
  return <ChallengeDetail id={id} />
}
```

### 5.2 Navigation Patterns

```typescript
// Programmatic navigation
import { useNavigate } from '@tanstack/react-router'

function Component() {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate({
      to: '/challenges/$id',
      params: { id: '123' }
    })
  }
}

// Declarative navigation
import { Link } from '@tanstack/react-router'

function NavLink() {
  return (
    <Link
      to="/challenges/$id"
      params={{ id: challenge.id }}
      className="hover:underline"
    >
      View Challenge
    </Link>
  )
}
```

---

## 6. State Management Implementation

### 6.1 Query Client Configuration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,   // 30 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
```

### 6.2 Query Key Factory

```typescript
// src/lib/queryConfig.ts
export const queryKeys = {
  // Challenges
  challenges: ['challenges'] as const,
  challengeList: (filters?: unknown) => ['challenges', 'list', filters] as const,
  challengeDetail: (id: string) => ['challenges', 'detail', id] as const,

  // Submissions
  submissions: ['submissions'] as const,
  submissionDetail: (id: string) => ['submissions', 'detail', id] as const,

  // Feedback
  feedback: ['feedback'] as const,
  submissionFeedback: (submissionId: string) =>
    ['feedback', 'submission', submissionId] as const,
} as const
```

### 6.3 Auth State Subscription

```typescript
// src/lib/authSubscription.ts
import { supabase } from './supabaseClient'
import { queryClient } from './queryClient'

// Single global auth listener - initialized in AppProvider
export function setupAuthSubscription() {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN') {
        // Invalidate user-specific queries
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      }

      if (event === 'SIGNED_OUT') {
        // Clear all cached data
        queryClient.clear()
      }
    }
  )

  return () => subscription.unsubscribe()
}
```

---

## 7. Styling Implementation

### 7.1 Global Theme (index.css)

```css
/* src/index.css */
@import 'tailwindcss';

@theme {
  /* Light mode colors */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.205 0 0);
  --color-primary-foreground: oklch(0.985 0 0);
  --color-muted: oklch(0.96 0 0);
  --color-muted-foreground: oklch(0.45 0 0);
  --color-border: oklch(0.922 0 0);

  /* Dark mode - via .dark class */
  .dark {
    --color-background: oklch(0.145 0 0);
    --color-foreground: oklch(0.985 0 0);
    --color-card: oklch(0.205 0 0);
    --color-primary: oklch(0.922 0 0);
    --color-muted: oklch(0.269 0 0);
    --color-border: oklch(1 0 0 / 0.1);
  }
}
```

### 7.2 Component Variants (CVA)

```typescript
// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

---

## 8. Animation Implementation

### 8.1 Motion Package Usage

```typescript
// Using 'motion' package (React 19 compatible)
import { motion } from 'motion'

function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg p-4"
    >
      Content here
    </motion.div>
  )
}
```

### 8.2 Page Transitions

```typescript
// src/components/ui/page-transition.tsx
import { motion } from 'motion'

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
```

---

## 9. Build Configuration

### 9.1 Vite Configuration

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true, // Auto route-based splitting
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'tanstack-vendor': ['@tanstack/react-query', '@tanstack/react-router'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['@radix-ui/react-*'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
```

### 9.2 TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 10. Environment Configuration

### 10.1 Required Environment Variables

```bash
# .env.local

# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI (Required for feedback)
VITE_GEMINI_API_KEY=your-gemini-api-key

# GitHub Token (Optional - increases rate limits)
VITE_GITHUB_TOKEN=your-github-pat
```

### 10.2 Environment Type Declarations

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GITHUB_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

_Document End_
