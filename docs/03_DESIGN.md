# PexFect - System Design

## Document Information

| Field             | Value                        |
| ----------------- | ---------------------------- |
| **Project Name**  | PexFect                      |
| **Version**       | 1.0.0                        |
| **Document Type** | System Design & Architecture |
| **Last Updated**  | January 2026                 |

---

## 1. Architecture Overview

### 1.1 Architecture Style: Modular Service-Oriented

PexFect follows a **Modular Service-Oriented Architecture** (MSA) where the frontend is organized into feature-based service modules. This is **NOT a monolithic** or micro-frontend architecture, but a well-structured modular monolith with clear boundaries.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PexFect Architecture                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Presentation Layer                              │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐  │  │
│  │  │  Pages  │  │ Layouts │  │   UI    │  │ Routes  │  │  Providers  │  │  │
│  │  │(routes)│  │         │  │ (ShadCN)│  │(Router) │  │(Query,Theme)│  │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └──────┬──────┘  │  │
│  └───────┼────────────┼────────────┼────────────┼───────────────┼────────┘  │
│          │            │            │            │               │            │
│          └────────────┴────────────┴────────────┴───────────────┘            │
│                                    │                                         │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Service Layer                                  │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │  │
│  │  │  Challenges  │ │   Feedback   │ │   Roadmap    │ │   Profile    │  │  │
│  │  │   Service    │ │   Service    │ │   Service    │ │   Service    │  │  │
│  │  │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │  │  │
│  │  │ │  api.ts  │ │ │ │  api.ts  │ │ │ │  api.ts  │ │ │ │  api.ts  │ │  │  │
│  │  │ │ hooks/   │ │ │ │ hooks/   │ │ │ │ hooks/   │ │ │ │ hooks/   │ │  │  │
│  │  │ │ comps/   │ │ │ │ comps/   │ │ │ │ comps/   │ │ │ │ comps/   │ │  │  │
│  │  │ │  lib/    │ │ │ │  lib/    │ │ │ │  lib/    │ │ │ │  lib/    │ │  │  │
│  │  │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │  │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │  │
│  │                                                                        │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                   │  │
│  │  │      AI      │ │   Resources  │ │     Home     │                   │  │
│  │  │   Service    │ │   Service    │ │   Service    │                   │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Infrastructure Layer                            │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐   │  │
│  │  │ Supabase Client│  │  Query Client  │  │   Query Config         │   │  │
│  │  │  (Database)    │  │  (TanStack)    │  │  (Keys, Cache)         │   │  │
│  │  └────────────────┘  └────────────────┘  └────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
              ┌─────────────────────────────────────────┐
              │           External Services              │
              │  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
              │  │Supabase │  │ GitHub  │  │ Gemini  │  │
              │  │   DB    │  │   API   │  │   AI    │  │
              │  └─────────┘  └─────────┘  └─────────┘  │
              └─────────────────────────────────────────┘
```

### 1.2 Key Architecture Decisions

| Decision                 | Rationale                                      |
| ------------------------ | ---------------------------------------------- |
| **Modular Services**     | Each feature is self-contained for scalability |
| **No Backend Server**    | Supabase BaaS reduces complexity and cost      |
| **Client-side AI calls** | Simplifies architecture (API key in env vars)  |
| **TanStack Query**       | Eliminates need for complex state management   |
| **File-based Routing**   | Type-safe routes with auto code-splitting      |

---

## 2. Service Module Pattern

Each service module follows a consistent structure:

### 2.1 Module Structure

```
src/services/[feature]/
├── api.ts              # All Supabase/external API calls
├── index.ts            # Public exports (encapsulation barrier)
├── components/         # Feature-specific UI components
│   ├── FeatureCard.tsx
│   └── FeatureList.tsx
├── hooks/              # TanStack Query hooks
│   ├── useFeature.ts
│   └── useFeatures.ts
└── lib/                # Helper functions, utilities
    ├── helpers.ts
    └── validators.ts
```

### 2.2 Data Flow Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Data Flow Pattern                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────────┐  │
│  │   User    │    │ Component │    │   Hook    │    │  Service API  │  │
│  │  Action   │───▶│  (React)  │───▶│ (Query)   │───▶│  (api.ts)     │  │
│  └───────────┘    └───────────┘    └───────────┘    └───────────────┘  │
│                                                              │          │
│                                                              ▼          │
│                                                     ┌───────────────┐   │
│                                                     │   Supabase/   │   │
│                                                     │   External    │   │
│                                                     └───────────────┘   │
│                                                              │          │
│                                                              ▼          │
│  ┌───────────┐    ┌───────────┐    ┌───────────────────────────────┐   │
│  │ Component │◀───│   Cache   │◀───│     TanStack Query Cache      │   │
│  │ Re-render │    │  Updated  │    │                               │   │
│  └───────────┘    └───────────┘    └───────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Import Rules

```typescript
// ✅ CORRECT: Import from service index
import { useChallenges, ChallengeCard } from '@/services/challenges'

// ❌ WRONG: Deep imports break encapsulation
import { ChallengeCard } from '@/services/challenges/components/ChallengeCard'
```

---

## 3. Technology Stack Design

### 3.1 Frontend Technologies

| Technology          | Version | Purpose                              |
| ------------------- | ------- | ------------------------------------ |
| **React**           | 19.2    | UI library with concurrent features  |
| **TypeScript**      | 5.9     | Type safety and developer experience |
| **TanStack Router** | 1.139   | File-based routing with type safety  |
| **TanStack Query**  | 5.90    | Server state management and caching  |
| **Tailwind CSS**    | 4.1     | Utility-first styling                |
| **ShadCN UI**       | Latest  | Accessible component primitives      |
| **Radix UI**        | Various | Headless UI components               |
| **Motion**          | 12.23   | Animation library                    |

### 3.2 Backend Technologies

| Technology             | Purpose                              |
| ---------------------- | ------------------------------------ |
| **Supabase**           | PostgreSQL database, Auth, Real-time |
| **Supabase Auth**      | GitHub OAuth authentication          |
| **Row Level Security** | Database-level access control        |

### 3.3 AI & External Services

| Service                   | Purpose                                 |
| ------------------------- | --------------------------------------- |
| **Google Gemini 2.5 Pro** | Code analysis and feedback generation   |
| **GitHub API**            | Repository validation and code fetching |

### 3.4 Build & Development

| Tool         | Purpose                     |
| ------------ | --------------------------- |
| **Vite**     | Build tool and dev server   |
| **Bun**      | Package manager and runtime |
| **ESLint**   | Code linting                |
| **Prettier** | Code formatting             |

---

## 4. Routing Design

### 4.1 Route Structure

```
src/routes/
├── __root.tsx              # Root layout (AppProvider, MainLayout)
├── index.tsx               # / (Home page)
├── profile.tsx             # /profile
├── progress.tsx            # /progress
├── challenges/
│   ├── index.tsx           # /challenges (list)
│   └── $id/
│       └── index.tsx       # /challenges/:id (detail)
├── feedback/
│   ├── $submissionId.tsx   # /feedback/:submissionId
│   └── demo.tsx            # /feedback/demo
├── resources/
│   └── index.tsx           # /resources
├── roadmap/
│   ├── index.tsx           # /roadmap (paths list)
│   └── $pathId/
│       └── index.tsx       # /roadmap/:pathId (path detail)
└── settings/
    └── index.tsx           # /settings
```

### 4.2 Route Configuration

```typescript
// Example route configuration
export const Route = createFileRoute('/challenges/$id/')({
  component: ChallengeDetailPage,
  // Optional: loader, beforeLoad, etc.
})

function ChallengeDetailPage() {
  const { id } = Route.useParams() // Type-safe params
  return <ChallengeDetail id={id} />
}
```

---

## 5. State Management Design

### 5.1 State Categories

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        State Management Strategy                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Server State (TanStack Query)                 │  │
│  │                                                                   │  │
│  │  • Challenges list and details                                    │  │
│  │  • User profile data                                              │  │
│  │  • Submissions and feedback                                       │  │
│  │  • Learning paths and progress                                    │  │
│  │  • Resources                                                      │  │
│  │                                                                   │  │
│  │  Features: Caching, Background refresh, Optimistic updates        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Client State (Local/Context)                  │  │
│  │                                                                   │  │
│  │  • Theme preference (next-themes)                                 │  │
│  │  • UI state (modals, filters, view toggles)                       │  │
│  │  • Form state (TanStack Form)                                     │  │
│  │  • Navigation state (TanStack Router)                             │  │
│  │                                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Auth State (Supabase)                         │  │
│  │                                                                   │  │
│  │  • Current user session                                           │  │
│  │  • Auth tokens (managed by Supabase)                              │  │
│  │  • Single global subscription (authSubscription.ts)               │  │
│  │                                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Query Configuration

```typescript
// Centralized in src/lib/queryConfig.ts

// Stale times
export const STALE_TIME = {
  SHORT: 30 * 1000,        // 30 seconds
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 30 * 60 * 1000,    // 30 minutes
}

// Cache validity (garbage collection time)
export const CACHE_VALIDITY = {
  SHORT: 5 * 60 * 1000,    // 5 minutes
  MEDIUM: 30 * 60 * 1000,  // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
}

// Query key factories
export const queryKeys = {
  challenges: ['challenges'] as const,
  challengeDetail: (id: string) => ['challenges', 'detail', id] as const,
  // ... more keys
}
```

---

## 6. Styling Design

### 6.1 Tailwind v4 Configuration

PexFect uses Tailwind CSS v4 with the new CSS-native approach:

```css
/* src/index.css - Theme configuration */

@import 'tailwindcss';

@theme {
  /* Color tokens */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-card: oklch(1 0 0);
  --color-primary: oklch(0.205 0 0);

  /* Dark mode overrides via @media or .dark class */
}
```

### 6.2 Component Styling Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Styling Strategy                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────┐                               │
│  │        Utility-First (Tailwind)     │                               │
│  │                                     │                               │
│  │  Used for: Layout, spacing, colors  │                               │
│  │  Example: className="flex gap-4"    │                               │
│  └─────────────────────────────────────┘                               │
│                    │                                                    │
│                    ▼                                                    │
│  ┌─────────────────────────────────────┐                               │
│  │     Component Variants (CVA)        │                               │
│  │                                     │                               │
│  │  Used for: Button, Badge variants   │                               │
│  │  Library: class-variance-authority  │                               │
│  └─────────────────────────────────────┘                               │
│                    │                                                    │
│                    ▼                                                    │
│  ┌─────────────────────────────────────┐                               │
│  │     Semantic Tokens (CSS Vars)      │                               │
│  │                                     │                               │
│  │  Used for: Theme colors             │                               │
│  │  Example: bg-card, text-foreground  │                               │
│  └─────────────────────────────────────┘                               │
│                    │                                                    │
│                    ▼                                                    │
│  ┌─────────────────────────────────────┐                               │
│  │     Feature CSS (When Needed)       │                               │
│  │                                     │                               │
│  │  Location: src/styles/[feature].css │                               │
│  │  Used for: Complex custom styles    │                               │
│  └─────────────────────────────────────┘                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. AI Feedback System Design

### 7.1 Feedback Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AI Feedback Generation Flow                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐                                                        │
│  │   Submit    │                                                        │
│  │  Solution   │                                                        │
│  └──────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │              URL Validation (Client-side)                │           │
│  │  • GitHub URL format                                     │           │
│  │  • Live site URL format                                  │           │
│  │  • Ownership verification (GitHub username match)        │           │
│  └─────────────────────────┬───────────────────────────────┘           │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │              Repository Visibility Check                 │           │
│  │  • Call GitHub API to verify repo is public              │           │
│  │  • Block submission if private                           │           │
│  └─────────────────────────┬───────────────────────────────┘           │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │              Code Fetching (githubFetcher.ts)            │           │
│  │  • Fetch repository file tree                            │           │
│  │  • Priority: src/ > components/ > pages/ > config        │           │
│  │  • Parallel file fetching with retry logic               │           │
│  │  • Size limits to stay under token limits                │           │
│  └─────────────────────────┬───────────────────────────────┘           │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │              AI Analysis (Gemini 2.5 Pro)                │           │
│  │  • Structured JSON prompt                                │           │
│  │  • Deterministic settings (temp=0, topK=1, topP=1)       │           │
│  │  • Scoring across 4 categories                           │           │
│  │  • Comparison with previous submission (if exists)       │           │
│  └─────────────────────────┬───────────────────────────────┘           │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │              Store Feedback (Supabase)                   │           │
│  │  • Save to challenge_feedback table                      │           │
│  │  • Link to submission                                    │           │
│  │  • Store generation metadata                             │           │
│  └─────────────────────────┬───────────────────────────────┘           │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────┐                                                        │
│  │  Display    │                                                        │
│  │  Feedback   │                                                        │
│  └─────────────┘                                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Scoring Categories

| Category          | Points | Evaluation Criteria                             |
| ----------------- | ------ | ----------------------------------------------- |
| **Design**        | 30     | Visual accuracy, responsiveness, UI/UX fidelity |
| **Code Quality**  | 30     | Structure, naming, best practices, DRY          |
| **Functionality** | 25     | Features work correctly, error handling         |
| **Accessibility** | 15     | Semantic HTML, ARIA, keyboard navigation        |

---

## 8. Database Design

### 8.1 Core Tables

```sql
-- User profiles (linked to Supabase auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge submissions
CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  challenge_id TEXT NOT NULL,
  github_url TEXT NOT NULL,
  live_site_url TEXT NOT NULL,
  screenshots TEXT[],
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  previous_submission_id UUID REFERENCES challenge_submissions(id)
);

-- AI-generated feedback
CREATE TABLE challenge_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES challenge_submissions(id),
  overall_score INTEGER NOT NULL,
  overall_rating TEXT NOT NULL,
  best_practices TEXT[],
  code_formatting TEXT[],
  functionality TEXT[],
  accessibility TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.2 Row Level Security

All tables have RLS policies ensuring users can only access their own data:

```sql
-- Example RLS policy
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 9. Security Design

### 9.1 Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  User   │────▶│  PexFect    │────▶│  Supabase   │────▶│   GitHub    │
│         │     │  Frontend   │     │    Auth     │     │   OAuth     │
└─────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                                     │                    │
     │          OAuth redirect              │                    │
     │◀─────────────────────────────────────│◀───────────────────│
     │                                     │                    │
     │          Authorization              │                    │
     │────────────────────────────────────▶│───────────────────▶│
     │                                     │                    │
     │          JWT Session                │                    │
     │◀─────────────────────────────────────│                    │
     │                                     │                    │
```

### 9.2 Security Measures

| Layer                      | Measure                  |
| -------------------------- | ------------------------ |
| **Authentication**         | OAuth 2.0 via GitHub     |
| **Authorization**          | Row Level Security (RLS) |
| **API Keys**               | Environment variables    |
| **Transport**              | HTTPS only               |
| **Input Validation**       | Client and server-side   |
| **Ownership Verification** | GitHub username matching |

---

## 10. Performance Design

### 10.1 Optimization Strategies

| Strategy               | Implementation                  |
| ---------------------- | ------------------------------- |
| **Code Splitting**     | TanStack Router auto-splitting  |
| **Bundle Chunking**    | Vite manualChunks configuration |
| **Query Caching**      | TanStack Query with stale times |
| **Image Optimization** | Lazy loading, modern formats    |
| **CDN**                | Vercel Edge Network             |

### 10.2 Bundle Structure

```javascript
// vite.config.ts - Chunk configuration
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'tanstack-vendor': ['@tanstack/react-query', '@tanstack/react-router'],
  'supabase-vendor': ['@supabase/supabase-js'],
  'ui-vendor': ['@radix-ui/*'],
  'animation-vendor': ['motion'],
}
```

---

_Document End_
