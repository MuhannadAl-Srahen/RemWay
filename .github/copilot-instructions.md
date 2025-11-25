# PexFect - Frontend-Focused Coding Challenge Platform

## Project Overview

PexFect is a modern web application designed to help developers master frontend development through hands-on coding challenges. Built with React 19, TypeScript, and Supabase, it offers an interactive learning experience with real-time feedback and progress tracking.

## Tech Stack

- **Frontend Framework**: React 19.2.0 with Vite 7.2.4
- **Language**: TypeScript 5.9.3 (strict mode)
- **Routing**: TanStack Router 1.139.3 (file-based routing with auto code-splitting)
- **Backend**: Supabase 2.84.0 (auth, database, storage)
- **State Management**: TanStack Query 5.90.10 (server state), Zustand 5.0.8 (client state)
- **UI Components**: ShadCN UI with Radix primitives
- **Styling**: Tailwind CSS 4.1.17 via `@tailwindcss/vite`
- **Animations**: Motion 12.23.24 (Framer Motion successor)
- **Form Handling**: TanStack Form 1.25.0 + Zod 4.1.13
- **Package Manager**: Bun
- **Linting**: ESLint 9.39.1 with TypeScript ESLint 8.47.0

## Architecture Patterns

### Directory Structure

```
src/
├── components/      # Reusable UI components (ShadCN primitives)
│   └── ui/         # Individual Radix-based components (button, card, etc.)
├── layouts/        # Page layouts and navigation (MainLayout, Navbar, Footer)
├── lib/            # Utilities, configs, Supabase client, query setup
├── providers/      # Context providers (AppProvider wraps QueryClient + ThemeProvider)
├── routes/         # TanStack Router file-based routes (auto-generated routeTree.gen.ts)
├── services/       # Feature-based modules (see Service Module Pattern below)
│   ├── challenges/ # Challenge listing, details, submission logic
│   ├── home/       # Landing page sections
│   ├── profile/    # User profile management
│   ├── resources/  # Learning resources
│   └── roadmap/    # Learning paths and progress tracking
├── styles/         # Global CSS and feature-specific styles
└── types/          # TypeScript type definitions (domain types + supabase.ts helpers)
```

### Service Module Pattern

Each service follows a **consistent, discoverable structure**:

```
services/[feature]/
├── api.ts              # Supabase queries and mutations
├── index.ts            # Public exports (components, hooks, API functions)
├── components/         # Feature-specific components
├── hooks/             # Custom React hooks (prefixed with 'use')
├── lib/               # Helper functions and utilities
├── utils/             # Utility functions (if different from lib)
└── data.ts            # Static/mock data (optional, prefer database queries)
```

**Key Pattern**: Import from service index (`@/services/challenges`) rather than deep imports. The `index.ts` acts as the public API surface.

### Code Quality Standards

#### TypeScript

- Use strict type checking (enabled in `tsconfig.json`)
- Avoid `any` - use proper types or `unknown`
- For Supabase operations, use type-safe helpers from `src/types/supabase.ts`:
  ```typescript
  import { SupabaseTable } from '@/types/supabase'
  const { data, error } = await (supabase
    .from('table_name')
    .select('*') as SupabaseTable)
  ```
- Export domain types from `src/types/` (e.g., `challenge.ts`, `profile.ts`)

#### React Best Practices

- **React 19**: Uses automatic JSX transform - **no need to import React**
- Use hooks consistently (`useState`, `useEffect`, custom hooks)
- Implement proper error boundaries for route-level errors
- Use `React.memo()` sparingly for expensive components

#### Component Guidelines

- Keep components focused and single-purpose
- Extract reusable logic into custom hooks (prefix with `use`)
- Use proper TypeScript prop types (avoid inline types for complex props)
- **Always implement loading and error states** for data-dependent components

#### State Management

- **Server State**: TanStack Query for all API calls (see `src/lib/queryConfig.ts`)
- **Client State**: Zustand for cross-component UI state (e.g., filters, modals)
- **Local State**: Keep state close to where it's used with `useState`
- **Global Config**: Centralize query configurations in `src/lib/queryConfig.ts`

### Data Fetching Pattern

**Critical**: All Supabase calls go through service-specific `api.ts` files:

```typescript
// services/challenges/api.ts
export const getChallengeById = async (
  id: string
): Promise<Challenge | null> => {
  try {
    const result = await getChallengeDetails(id)
    return result
  } catch (err) {
    console.error('[getChallengeById] error', err)
    return null
  }
}

// services/challenges/hooks/useChallenges.ts
export const useChallenges = () => {
  return useQuery<ChallengeListItem[], Error>({
    queryKey: ['challenges'],
    queryFn: getChallenges,
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_VALIDITY.MEDIUM,
  })
}
```

**Query Key Pattern**: Use `queryKeys` factory from `src/lib/queryConfig.ts`:

```typescript
queryKey: queryKeys.challengeDetail(id), // Standardized cache keys
```

### Routing with TanStack Router

**File-based routing** with automatic code-splitting enabled in `vite.config.ts`:

```typescript
// routes/challenges/$id/index.tsx
export const Route = createFileRoute('/challenges/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams() // Type-safe params
  // Component logic
}
```

**Important**: Route tree is auto-generated in `src/routeTree.gen.ts` - **never edit manually**.

### Authentication

- Managed through Supabase Auth
- **Centralized listener**: `src/lib/authSubscription.ts` initializes ONE global auth listener
  - Called in `AppProvider` to prevent duplicate subscriptions
  - Auto-invalidates profile/saved queries on logout
- Route protection: Check auth state with `supabase.auth.getUser()` in components
- Auth errors are handled globally in `queryClient.ts` (401/403 = no retry)

### Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no separate config file needed)
- Use utility classes exclusively (no custom CSS unless feature-specific)
- Mobile-first responsive design (`sm:`, `md:`, `lg:` breakpoints)
- Theme support via `next-themes` (light/dark/system modes)
- CSS custom properties defined in `src/index.css` for theming
- Component-specific styles only in `src/styles/[feature].css` (e.g., `profile.css`)

## Development Workflow

### Getting Started

```bash
# Install dependencies
bun install

# Start development server (runs on port 5000)
bun dev

# Build for production (includes TypeScript check)
bun run build

# Run linter
bun run lint

# Format code with Prettier
bun run format
```

### Build Configuration

**Bundle splitting** configured in `vite.config.ts`:

- `react-vendor`: React + ReactDOM
- `tanstack-vendor`: TanStack Query/Router/Form
- `supabase-vendor`: Supabase client
- `ui-vendor`: All Radix UI primitives
- `animation-vendor`: Motion/Framer Motion

Auto code-splitting enabled for routes via TanStack Router plugin.

### Git Workflow

- Feature branches: `feature/pf-[issue-number]-description`
- Commit format: `type(scope): description`
  - Types: feat, fix, refactor, docs, style, test, chore
- Keep commits atomic and focused

### Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] No console.log statements
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Responsive design works on mobile
- [ ] Accessibility considerations
- [ ] Performance optimizations applied

## Common Patterns

### Creating a New Service

1. Create folder in `src/services/[feature-name]/`
2. Add `api.ts` for Supabase queries
3. Create `hooks/` for React Query hooks
4. Add `components/` for UI components
5. Export public API in `index.ts`

### Type-Safe Supabase Queries

```typescript
import { SupabaseTable } from '@/types/supabase'
import { supabase } from '@/lib/supabaseClient'

const { data, error } = await (supabase
  .from('table_name')
  .select('*') as SupabaseTable<MyType>)
```

### React Query Hook Pattern

```typescript
import { useQuery } from '@tanstack/react-query'
import { STALE_TIME, CACHE_VALIDITY } from '@/lib/queryConfig'

export const useFeature = () => {
  return useQuery({
    queryKey: ['feature'],
    queryFn: fetchFeature,
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_VALIDITY.LONG,
  })
}
```

### Error Handling Pattern

Global error handling in `src/lib/queryClient.ts`:

- Auth errors (401/403) don't retry automatically
- Supabase JWT errors (PGRST301) don't retry
- Other errors retry up to 3 times with exponential backoff
- Network mode set to `online` for all queries/mutations

## Important Notes

- Always run `bun run lint` before committing
- Use absolute imports with `@/` prefix
- Follow existing code patterns for consistency
- Document complex logic with comments
- Keep bundle size optimized (use lazy loading)

## Resources

- [React 19 Docs](https://react.dev)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Supabase Docs](https://supabase.com/docs)
- [ShadCN UI](https://ui.shadcn.com)
