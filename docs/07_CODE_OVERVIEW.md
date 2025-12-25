# PexFect - Code Overview & Technical Reference

## Document Information

| Field             | Value                   |
| ----------------- | ----------------------- |
| **Project Name**  | PexFect                 |
| **Version**       | 1.0.0                   |
| **Document Type** | Technical Code Overview |
| **Last Updated**  | January 2026            |

---

## 1. Technology Stack Summary

### 1.1 Core Technologies

| Category               | Technology      | Version | Purpose                             |
| ---------------------- | --------------- | ------- | ----------------------------------- |
| **Frontend Framework** | React           | 19.2    | UI library with concurrent features |
| **Language**           | TypeScript      | 5.9     | Type-safe JavaScript                |
| **Routing**            | TanStack Router | 1.139   | File-based, type-safe routing       |
| **Server State**       | TanStack Query  | 5.90    | Data fetching, caching, sync        |
| **Form Handling**      | TanStack Form   | 1.25    | Type-safe form management           |
| **Styling**            | Tailwind CSS    | 4.1     | Utility-first CSS framework         |
| **Build Tool**         | Vite            | 7.2     | Fast dev server and bundler         |
| **Runtime**            | Bun             | Latest  | Fast JavaScript runtime             |

### 1.2 UI Libraries

| Library          | Version | Purpose               |
| ---------------- | ------- | --------------------- |
| **ShadCN UI**    | Latest  | Component templates   |
| **Radix UI**     | Various | Accessible primitives |
| **Lucide React** | 0.539   | Icon library          |
| **Motion**       | 12.23   | Animations            |
| **next-themes**  | 0.4     | Dark/light mode       |
| **CVA**          | 0.7     | Component variants    |

### 1.3 Backend & Services

| Service           | Purpose                              |
| ----------------- | ------------------------------------ |
| **Supabase**      | PostgreSQL database, Authentication  |
| **GitHub OAuth**  | User authentication                  |
| **GitHub API**    | Repository validation, code fetching |
| **Google Gemini** | AI feedback generation               |

### 1.4 Development Tools

| Tool                     | Purpose            |
| ------------------------ | ------------------ |
| **ESLint**               | Code linting       |
| **Prettier**             | Code formatting    |
| **TypeScript**           | Type checking      |
| **Vite**                 | Development server |
| **React Query Devtools** | Query debugging    |
| **Router Devtools**      | Route debugging    |

---

## 2. Project Architecture

### 2.1 Architecture Type

**Modular Service-Oriented Architecture** - A frontend monolith organized into feature-based modules.

```
┌─────────────────────────────────────────────────────────────┐
│                        PexFect                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Routes    │  │   Layouts   │  │     Components      │  │
│  │  (Pages)    │  │             │  │       (UI)          │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │            │
│         └────────────────┼─────────────────────┘            │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                     Services                          │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────────┐ │   │
│  │  │Challen-│ │Feedback│ │Roadmap │ │ AI / Profile / │ │   │
│  │  │  ges   │ │        │ │        │ │  Resources     │ │   │
│  │  └────────┘ └────────┘ └────────┘ └────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Infrastructure (lib/)                   │   │
│  │  ┌──────────┐ ┌───────────┐ ┌────────────────────┐  │   │
│  │  │ Supabase │ │Query Clnt │ │   Query Config     │  │   │
│  │  └──────────┘ └───────────┘ └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Key Design Principles

1. **Feature-Based Organization** - Code grouped by domain, not type
2. **Encapsulation** - Services expose only public APIs via `index.ts`
3. **Separation of Concerns** - API, hooks, components in separate files
4. **Type Safety** - Full TypeScript with strict mode
5. **Single Source of Truth** - Centralized query config and types

---

## 3. Directory Structure Reference

```
pexfect/
├── docs/                       # Documentation (this is here!)
├── public/                     # Static assets
├── scripts/                    # Development scripts
├── src/
│   ├── assets/                # Images, icons, fonts
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── components/            # Shared UI components
│   │   └── ui/                # ShadCN/Radix primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── skeleton.tsx
│   │       └── ... (20+ components)
│   │
│   ├── layouts/               # Page layouts
│   │   ├── MainLayout.tsx     # Root layout with nav/footer
│   │   ├── PageLayout.tsx     # Content wrapper
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── Footer.tsx         # Page footer
│   │   ├── EmptyState.tsx     # Empty state component
│   │   ├── PageHeader.tsx     # Page title component
│   │   └── navbar/            # Navbar sub-components
│   │
│   ├── lib/                   # Core utilities
│   │   ├── supabaseClient.ts  # Supabase initialization
│   │   ├── queryClient.ts     # TanStack Query setup
│   │   ├── queryConfig.ts     # Query keys & timing
│   │   ├── authSubscription.ts # Auth state listener
│   │   ├── constants.ts       # App constants
│   │   ├── utils.ts           # Helper functions (cn, etc.)
│   │   ├── usePagination.ts   # Pagination hook
│   │   └── useDelayedLoading.ts # Loading delay hook
│   │
│   ├── providers/             # React context providers
│   │   ├── AppProvider.tsx    # QueryClient + Theme
│   │   └── index.ts           # Re-exports
│   │
│   ├── routes/                # TanStack Router pages
│   │   ├── __root.tsx         # Root layout
│   │   ├── index.tsx          # Home page (/)
│   │   ├── profile.tsx        # Profile page (/profile)
│   │   ├── progress.tsx       # Progress page (/progress)
│   │   ├── challenges/
│   │   │   ├── index.tsx      # /challenges
│   │   │   └── $id/
│   │   │       └── index.tsx  # /challenges/:id
│   │   ├── feedback/
│   │   │   ├── $submissionId.tsx # /feedback/:submissionId
│   │   │   └── demo.tsx       # /feedback/demo
│   │   ├── resources/
│   │   │   └── index.tsx      # /resources
│   │   ├── roadmap/
│   │   │   ├── index.tsx      # /roadmap
│   │   │   └── $pathId/
│   │   │       └── index.tsx  # /roadmap/:pathId
│   │   └── settings/
│   │       └── index.tsx      # /settings
│   │
│   ├── services/              # Feature modules
│   │   ├── ai/                # AI feedback service
│   │   │   ├── api.ts         # Gemini API calls
│   │   │   ├── githubFetcher.ts # GitHub code fetching
│   │   │   ├── validation.ts  # URL validation
│   │   │   └── index.ts       # Public exports
│   │   │
│   │   ├── challenges/        # Challenge management
│   │   │   ├── api.ts         # Supabase queries
│   │   │   ├── components/    # ChallengeCard, etc.
│   │   │   ├── hooks/         # useChallenge, etc.
│   │   │   ├── lib/           # Helpers
│   │   │   └── index.ts
│   │   │
│   │   ├── feedback/          # Feedback display
│   │   │   ├── api.ts
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   │
│   │   ├── home/              # Landing page
│   │   │   └── components/
│   │   │
│   │   ├── profile/           # User profile
│   │   │   ├── api.ts
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   │
│   │   ├── resources/         # Learning resources
│   │   │   ├── api.ts
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   │
│   │   └── roadmap/           # Learning paths
│   │       ├── api.ts
│   │       ├── components/
│   │       ├── hooks/
│   │       └── index.ts
│   │
│   ├── styles/                # Feature-specific CSS
│   │   └── profile.css
│   │
│   ├── types/                 # TypeScript definitions
│   │   ├── index.ts           # Re-exports all types
│   │   ├── auth.ts            # Auth types
│   │   ├── challenge.ts       # Challenge types
│   │   ├── feedback.ts        # Feedback types
│   │   ├── profile.ts         # Profile types
│   │   ├── resource.ts        # Resource types
│   │   ├── roadmap.ts         # Roadmap types
│   │   ├── components.ts      # Component prop types
│   │   └── supabase.ts        # Supabase type helpers
│   │
│   ├── index.css              # Global styles & theme
│   ├── main.tsx               # App entry point
│   ├── routeTree.gen.ts       # Auto-generated (DON'T EDIT)
│   └── vite-env.d.ts          # Vite type declarations
│
├── .env.example               # Environment template
├── components.json            # ShadCN configuration
├── eslint.config.js           # ESLint configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite configuration
└── vercel.json                # Deployment config
```

---

## 4. Key Files Reference

### 4.1 Configuration Files

| File               | Purpose              | Key Settings             |
| ------------------ | -------------------- | ------------------------ |
| `vite.config.ts`   | Build configuration  | Plugins, aliases, chunks |
| `tsconfig.json`    | TypeScript settings  | Strict mode, paths       |
| `eslint.config.js` | Linting rules        | React, TypeScript rules  |
| `components.json`  | ShadCN configuration | Component paths          |
| `vercel.json`      | Deployment config    | Routing, headers         |

### 4.2 Core Library Files

| File                      | Purpose                        |
| ------------------------- | ------------------------------ |
| `lib/supabaseClient.ts`   | Supabase client initialization |
| `lib/queryClient.ts`      | TanStack Query configuration   |
| `lib/queryConfig.ts`      | Query keys, stale times        |
| `lib/authSubscription.ts` | Global auth listener           |
| `lib/utils.ts`            | Utility functions (cn, etc.)   |

### 4.3 Type Definition Files

| File                 | Key Types                          |
| -------------------- | ---------------------------------- |
| `types/challenge.ts` | `Challenge`, `ChallengeFilter`     |
| `types/feedback.ts`  | `AIFeedbackResponse`, `Submission` |
| `types/profile.ts`   | `UserProfile`, `ProfileStats`      |
| `types/supabase.ts`  | `Database`, `SupabaseTable`        |

---

## 5. Code Patterns & Conventions

### 5.1 Naming Conventions

| Type       | Convention              | Example                  |
| ---------- | ----------------------- | ------------------------ |
| Components | PascalCase              | `ChallengeCard.tsx`      |
| Hooks      | camelCase, use prefix   | `useChallenge.ts`        |
| Utilities  | camelCase               | `formatDate.ts`          |
| Constants  | SCREAMING_SNAKE         | `STALE_TIME.MEDIUM`      |
| Types      | PascalCase              | `type Challenge = {...}` |
| Files      | kebab-case or camelCase | `query-config.ts`        |

### 5.2 Import Patterns

```typescript
// ✅ CORRECT: Use path alias
import { Button } from '@/components/ui/button'
import { useChallenges } from '@/services/challenges'
import type { Challenge } from '@/types'

// ❌ WRONG: Relative paths for cross-module imports
import { Button } from '../../../components/ui/button'
```

### 5.3 Service Module Pattern

```typescript
// Every service follows this structure:

// api.ts - All external calls
export async function getData() {
  const { data } = await supabase.from('table').select('*')
  return data
}

// hooks/useData.ts - TanStack Query wrapper
export function useData() {
  return useQuery({
    queryKey: queryKeys.data,
    queryFn: getData,
    staleTime: STALE_TIME.MEDIUM,
  })
}

// index.ts - Public API only
export { getData } from './api'
export { useData } from './hooks/useData'
export { DataCard } from './components/DataCard'
```

### 5.4 Component Patterns

```typescript
// Functional components with TypeScript
interface Props {
  id: string
  title: string
  onAction?: () => void
}

export function MyComponent({ id, title, onAction }: Props) {
  // Hooks at top
  const { data, isLoading } = useData(id)

  // Early returns for loading/error
  if (isLoading) return <Skeleton />
  if (!data) return null

  // Main render
  return (
    <div className="flex gap-4">
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  )
}
```

---

## 6. API & Data Flow

### 6.1 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Data Flow                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────────────────┐  │
│  │   User      │    │  Component  │    │     TanStack Query       │  │
│  │  Action     │───▶│   (React)   │───▶│  useQuery / useMutation  │  │
│  └─────────────┘    └─────────────┘    └────────────┬─────────────┘  │
│                                                      │               │
│                                                      ▼               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Service API Layer                          │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  api.ts functions                                       │  │   │
│  │  │  - getChallenges()                                      │  │   │
│  │  │  - submitSolution()                                     │  │   │
│  │  │  - generateFeedback()                                   │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                            │                                         │
│          ┌─────────────────┼─────────────────┐                      │
│          ▼                 ▼                 ▼                      │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐                │
│  │  Supabase  │    │  GitHub    │    │  Gemini    │                │
│  │  Database  │    │    API     │    │    AI      │                │
│  └────────────┘    └────────────┘    └────────────┘                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 Query Key Structure

```typescript
// Centralized in lib/queryConfig.ts
export const queryKeys = {
  // Auth
  auth: ['auth'],
  currentUser: ['auth', 'currentUser'],

  // Challenges
  challenges: ['challenges'],
  challengeDetail: (id: string) => ['challenges', 'detail', id],
  challengeList: (filters?: unknown) => ['challenges', 'list', filters],

  // Submissions
  submissions: ['submissions'],
  submissionDetail: (id: string) => ['submissions', 'detail', id],

  // Feedback
  feedback: ['feedback'],
  submissionFeedback: (submissionId: string) =>
    ['feedback', 'submission', submissionId],

  // Profile
  profile: ['profile'],
  profileDetail: (userId: string) => ['profile', 'detail', userId],
  savedChallenges: (userId: string) => ['profile', 'savedChallenges', userId],

  // Roadmap
  roadmap: ['roadmap'],
  learningPaths: ['roadmap', 'paths'],
  pathDetail: (id: string) => ['roadmap', 'path', id],
}
```

---

## 7. Authentication Flow

### 7.1 GitHub OAuth Process

```
┌────────┐     ┌──────────────┐     ┌────────────┐     ┌────────┐
│  User  │────▶│   PexFect    │────▶│  Supabase  │────▶│ GitHub │
└────────┘     └──────────────┘     └────────────┘     └────────┘
    │                 │                   │                 │
    │  Click Sign In  │                   │                 │
    │────────────────▶│                   │                 │
    │                 │  Redirect         │                 │
    │                 │──────────────────▶│                 │
    │                 │                   │  OAuth Request  │
    │                 │                   │────────────────▶│
    │                 │                   │                 │
    │                 │                   │◀────────────────│
    │                 │                   │  Auth Code      │
    │                 │◀──────────────────│                 │
    │                 │  JWT Session      │                 │
    │◀────────────────│                   │                 │
    │  Authenticated  │                   │                 │
```

### 7.2 Auth Implementation

```typescript
// Sign in
await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: { redirectTo: window.location.origin },
})

// Sign out
await supabase.auth.signOut()

// Get current user (server-side check)
const { data: { user } } = await supabase.auth.getUser()

// Auth state subscription (single global listener)
// Located in lib/authSubscription.ts
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    queryClient.invalidateQueries({ queryKey: ['profile'] })
  }
  if (event === 'SIGNED_OUT') {
    queryClient.clear()
  }
})
```

---

## 8. Styling System

### 8.1 Tailwind v4 Theme

```css
/* src/index.css */
@import 'tailwindcss';

@theme {
  /* Base colors */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);

  /* Component colors */
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.205 0 0);
  --color-primary-foreground: oklch(0.985 0 0);
  --color-muted: oklch(0.96 0 0);
  --color-muted-foreground: oklch(0.45 0 0);

  /* Dark mode */
  .dark {
    --color-background: oklch(0.145 0 0);
    --color-foreground: oklch(0.985 0 0);
    /* ... */
  }
}
```

### 8.2 Component Styling

```typescript
// Using semantic color tokens
<div className="bg-card text-card-foreground border border-border">
  <h2 className="text-foreground">Title</h2>
  <p className="text-muted-foreground">Subtitle</p>
</div>

// Using CVA for variants
import { buttonVariants } from '@/components/ui/button'

<button className={buttonVariants({ variant: 'default', size: 'lg' })}>
  Click me
</button>
```

---

## 9. Build & Deployment

### 9.1 Scripts

```bash
# Development
bun dev          # Start dev server on port 5000

# Build
bun run build    # TypeScript check + Vite build

# Code Quality
bun run lint     # ESLint check
bun run format   # Prettier format

# Preview
bun run preview  # Preview production build
```

### 9.2 Environment Variables

```bash
# Required
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
VITE_GEMINI_API_KEY=AIzaSy...

# Optional
VITE_GITHUB_TOKEN=ghp_xxx...  # Increases API rate limits
```

### 9.3 Deployment (Vercel)

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 10. Quick Reference

### 10.1 Common Tasks

| Task                 | Command / Location                    |
| -------------------- | ------------------------------------- |
| Add a new route      | Create file in `src/routes/`          |
| Add UI component     | `bunx shadcn@latest add [component]`  |
| Add service function | Add to `services/[feature]/api.ts`    |
| Add hook             | Create in `services/[feature]/hooks/` |
| Add type             | Add to `types/[domain].ts`            |
| Modify theme         | Edit `src/index.css`                  |

### 10.2 Important Rules

1. **Never edit `routeTree.gen.ts`** - It's auto-generated
2. **Always use `@/` alias** for imports
3. **Import from service `index.ts`** only
4. **Check auth before protected operations**
5. **Use `queryKeys` factory** for cache keys
6. **Use semantic color tokens** for theming

### 10.3 Debugging Tools

| Tool                 | Access                         |
| -------------------- | ------------------------------ |
| React Query Devtools | Bottom-left corner (dev mode)  |
| Router Devtools      | Bottom-right corner (dev mode) |
| Supabase Dashboard   | supabase.com/dashboard         |
| Browser DevTools     | F12 or Cmd+Opt+I               |

---

_Document End_
