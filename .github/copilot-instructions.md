# PexFect Copilot Instructions

## Project Overview

PexFect is a React 19 web application for frontend developers to practice coding challenges. Built with TanStack Router (file-based routing), TanStack Query (server state), Supabase (backend/auth), and Tailwind CSS v4 with ShadCN UI components.

## Architecture & Key Patterns

### Routing (TanStack Router)

- **File-based routing**: Routes defined in `src/routes/` with automatic route tree generation
- **Route definition pattern**: Use `createFileRoute` to define routes
  ```tsx
  export const Route = createFileRoute('/challenges/$id/')({
    component: RouteComponent,
  })
  ```
- **Route params**: Access with `Route.useParams()` (e.g., `const { id } = Route.useParams()`)
- **Navigation**: Use `useNavigate()` for programmatic navigation or `<Link>` for declarative
- **Route tree**: Auto-generated in `src/routeTree.gen.ts` by `@tanstack/router-plugin`

### Service Layer Architecture

Services organized by domain in `src/services/` - **ALL services follow consistent structure**:

- **Standard structure**: Every service MUST have:
  ```
  src/services/service-name/
  ├── api.ts              # Supabase queries and data fetching
  ├── index.ts            # Re-export public API
  ├── hooks/              # React Query hooks (useQuery/useMutation)
  ├── components/         # Service-specific components
  └── lib/                # Utility functions and helpers
  ```
- **Naming conventions**: Service folders use lowercase (e.g., `challenges/`, `resources/`, `home/`, `profile/`)
- **API pattern**: Functions in `api.ts` use Supabase client directly (e.g., `getChallengeById`, `getResources`, `ProfileService.getProfile`)
- **Hook pattern**: Wrap API calls with `useQuery`/`useMutation` from TanStack Query:
  ```tsx
  // src/services/challenges/hooks/useChallenges.ts
  export const useChallenges = () => {
    return useQuery<ChallengeListItem[], Error>({
      queryKey: ['challenges'],
      queryFn: getChallenges,
      staleTime: 1000 * 60 * 5, // 5 minutes
    })
  }
  ```

### Type Organization

- **Centralized types**: All types organized in `src/types/` by domain
  ```
  src/types/
  ├── index.ts           # Re-exports all types
  ├── challenge.ts       # Challenge-related types
  ├── profile.ts         # Profile and user types
  ├── resource.ts        # Resource types
  ├── auth.ts            # Authentication types
  ├── roadmap.ts         # Learning path types
  ├── feedback.ts        # Feedback types
  └── components.ts      # Component props types
  ```
- **Import pattern**: Always import from `@/types` (never from subdirectories)
  ```tsx
  import type { Challenge, UserProfile, ResourceItem } from '@/types'
  ```
- **Database mapping**: API functions map snake_case DB columns to camelCase (e.g., `thumbnail_url` → `image`)
- **Type guards**: Use helper functions like `toStr()`, `toId()`, `toStrArray()` in data mappers

### Data Fetching & Caching (TanStack Query)

- **Query client**: Configured in `src/lib/queryClient.ts` with smart retry logic (no retry on 401/403)
- **Query keys**: Use descriptive arrays (e.g., `['challenge', id]`, `['profile', userId]`)
- **Stale time**: Challenges use 5min stale time; adjust based on data volatility
- **Auth error handling**: Don't retry on JWT expiry (PGRST301) or 401/403 errors

### Supabase Integration

- **Client**: Dual-file setup for type safety - `supabaseClient.js` (runtime) + `supabaseClient.ts` (typed wrapper)
- **Environment vars**: Uses fallback pattern for runtime env injection (supports Vercel, Docker, meta tags):
  ```javascript
  // Checks: import.meta.env → window.__ENV → window.VITE_* → meta tags
  ```
- **Auth**: GitHub OAuth with allowlist validation (`signInWithGitHub` in `supabaseClient.js`)
- **Type casting**: Database queries require type casting for mutations: `(supabase.from('table') as any).insert(...)`

### State Management

- **No Zustand found**: Despite README mention, no Zustand stores exist (likely removed)
- **Server state**: TanStack Query handles all async state
- **Client state**: React hooks (useState, useContext) for local UI state
- **Profile data**: Stored in `profiles` table with `social_links` JSONB for flexible data (includes `learningPaths`)

### Styling & Components

- **Tailwind v4**: Configured via `@tailwindcss/vite` plugin in `vite.config.ts`
- **Theme**: Dark mode via `next-themes` with system preference support (`AppProvider.tsx`)
- **Utility**: `cn()` helper in `src/lib/utils.ts` merges class names with tailwind-merge
- **UI components**: ShadCN UI components in `src/components/ui/` (Radix UI primitives)
- **Path alias**: Use `@/` for imports (resolves to `src/`) - configured in `vite.config.ts` and `tsconfig.json`

### Layout System

- **MainLayout**: Wraps all routes with Navbar + Footer + scroll restoration logic
- **Scroll restoration**: Custom implementation in `src/lib/scrollRestoration.ts` (saves/restores per pathname)
- **Conditional footer**: Footer hidden on challenge detail pages (`/challenges/:id`)

## Development Workflows

### Running the App

```bash
bun install        # Install dependencies (Bun is preferred)
bun run dev        # Start dev server on port 5000
bun run build      # TypeScript check + Vite build
bun run preview    # Preview production build
```

### Code Quality

```bash
bun run format     # Format with Prettier
bun run check      # Check formatting
bun run lint       # Lint with ESLint
```

### Adding New Routes

1. Create file in `src/routes/` (e.g., `src/routes/new-feature/index.tsx`)
2. Export route with `createFileRoute('/new-feature/')`
3. Route tree auto-regenerates on save (watch mode in dev)

### Adding New Services

Follow the standardized pattern (ALL services MUST follow this structure):

```
src/services/feature-name/
├── api.ts              # Supabase queries
├── index.ts            # Re-export public API
├── hooks/              # React Query hooks
├── components/         # Feature-specific components
└── lib/                # Utilities (optional)
```

## Critical Conventions

### TypeScript Types

- **Centralized types**: All types organized in `src/types/` by domain:
  - `challenge.ts` - Challenge and submission types
  - `profile.ts` - User profile and stats types
  - `resource.ts` - Learning resource types
  - `auth.ts` - Authentication types
  - `roadmap.ts` - Learning path types
  - `feedback.ts` - Feedback and review types
  - `components.ts` - Component props types
- **Import pattern**: Always import from `@/types` (uses central re-export)
  ```tsx
  import type { Challenge, UserProfile, ResourceItem } from '@/types'
  ```
- **Database types**: DB-specific types (DbProfile, DbChallenge, etc.) also live in `src/types/` for consistency
- **Type guards**: Use helper functions like `toStr()`, `toId()`, `toStrArray()` in data mappers

### Error Handling

- **API errors**: Log to console with contextual prefixes (e.g., `[getChallenges] Supabase error:`)
- **Graceful degradation**: Return `null` or empty arrays on fetch errors
- **User feedback**: Handle submission errors with specific error codes (e.g., `GITHUB_URL_USED`, `OFFICIAL_URL_USED`)

### File Naming

- **Components**: PascalCase (e.g., `ChallengeCard.tsx`)
- **Routes**: kebab-case folders, `index.tsx` files (e.g., `challenges/$id/index.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useProfile.ts`)
- **API/utils**: camelCase (e.g., `getChallenges.ts`)

### Build Optimization

- **Code splitting**: Manual chunks in `vite.config.ts` for vendor libraries (React, TanStack, Radix UI)
- **Auto code splitting**: Enabled for TanStack Router routes
- **Chunk size limit**: Set to 600KB (above default to accommodate vendor chunks)

## Integration Points

### Supabase Tables

- `challenges`: Challenge data with snake_case columns
- `profiles`: User profiles with `social_links` JSONB column (includes `learningPaths`)
- `challenge_submissions`: User submissions with validation logic
- **RLS policies**: Required for anonymous access (see database-setup.sql)

### Authentication Flow

1. User clicks GitHub sign-in → `signInWithGitHub()` clears session
2. Validates origin against allowlist (prevents open redirect)
3. Redirects to GitHub OAuth with `prompt: 'select_account'`
4. On return, profile auto-created/fetched from `profiles` table
5. Session persisted via Supabase auth config

### Learning Path Progress

When submitting challenges:

1. Record submission in `challenge_submissions` table
2. Calculate progress for difficulty level (beginner/intermediate/advanced)
3. Merge with existing `learningPaths` in profile's `social_links`
4. Update via `ProfileService.updateProfile()` (preserves nested JSONB)
