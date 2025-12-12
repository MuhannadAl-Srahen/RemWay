# PexFect - AI Coding Agent Instructions

## Quick Context

Frontend coding challenge platform: React 19 + TypeScript + TanStack Router/Query + Supabase + Tailwind v4. AI feedback via Gemini 2.5 Pro.

## Essential Commands

```bash
bun install          # Install deps (uses Bun, NOT npm/yarn/pnpm)
bun dev              # Dev server at localhost:5000
bun run build        # TypeScript check + production build
bun run lint         # ESLint check (run before commits)
bun run format       # Prettier formatting
```

## Architecture: Service Module Pattern

Each feature in `src/services/[feature]/` follows this structure:

```
services/challenges/
├── api.ts           # Supabase queries - ALL DB calls go here
├── index.ts         # Public exports only
├── components/      # Feature-specific UI components
├── hooks/           # TanStack Query hooks (useChallenge, useChallenges)
└── lib/             # Helper functions, data fetchers
```

**Critical Import Rule**: Always import from service index, never deep paths:

```typescript
// ✅ Correct
import { useChallenges, ChallengeGridItem } from '@/services/challenges'

// ❌ Wrong - breaks encapsulation
import { ChallengeGridItem } from '@/services/challenges/components/ChallengeGridItem'
```

## Data Flow Pattern

```
User Action → Component → Hook → Service API → Supabase/External API
                                      ↓
                              TanStack Query Cache
                                      ↓
                              Component Re-render
```

## Query Configuration (`src/lib/queryConfig.ts`)

Use factory functions for cache keys and constants for timing:

```typescript
import { queryKeys, STALE_TIME, CACHE_VALIDITY } from '@/lib/queryConfig'

export const useChallenges = () =>
  useQuery({
    queryKey: queryKeys.challenges, // Use factory, NOT raw ['challenges']
    queryFn: getChallenges,
    staleTime: STALE_TIME.MEDIUM, // 5 min for moderately static data
    gcTime: CACHE_VALIDITY.MEDIUM, // 30 min cache retention
  })
```

## Key Files Reference

| File                            | Purpose                                               |
| ------------------------------- | ----------------------------------------------------- |
| `src/lib/queryConfig.ts`        | Query key factories + cache timing constants          |
| `src/lib/queryClient.ts`        | Global error handling (401/403 skip retry)            |
| `src/lib/authSubscription.ts`   | Single global auth listener (in AppProvider)          |
| `src/routeTree.gen.ts`          | **AUTO-GENERATED - never edit**                       |
| `src/types/supabase.ts`         | Type helpers: `SupabaseTable`, `SupabaseQueryBuilder` |
| `src/providers/AppProvider.tsx` | QueryClient + ThemeProvider setup                     |

## Routing (TanStack Router)

File-based routing with auto code-splitting. Routes live in `src/routes/`:

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

Navigation patterns:

```typescript
import { useNavigate, Link } from '@tanstack/react-router'

// Programmatic
navigate({ to: '/challenges/$id', params: { id: '123' } })

// Declarative
<Link to="/challenges/$id" params={{ id }}>View</Link>
```

## Styling (Tailwind v4.1)

- **No tailwind.config.js** - uses `@tailwindcss/vite` plugin
- Theme via CSS custom properties in `src/index.css`
- Dark mode: `next-themes` with class-based switching
- Feature CSS in `src/styles/[feature].css` (only when needed)

Use semantic color tokens:

```tsx
<div className='bg-card text-card-foreground border-border'>
  <h2 className='text-foreground'>Title</h2>
  <p className='text-muted-foreground'>Subtitle</p>
</div>
```

## Component Patterns

- **UI primitives**: `src/components/ui/` (ShadCN/Radix)
- **Feature components**: `src/services/[feature]/components/`
- **Layouts**: `src/layouts/` (MainLayout, PageLayout, Navbar)
- **Animation**: Use `motion` package (not `framer-motion` import)

```typescript
import { motion } from 'motion' // ✅ Correct for React 19
```

## Supabase Patterns

```typescript
import { supabase } from '@/lib/supabaseClient'
import type { SupabaseTable } from '@/types/supabase'

// Type-safe queries (cast when needed for complex queries)
const { data, error } = await (supabase
  .from('challenges')
  .select('*') as SupabaseTable)

// Always verify auth before protected operations
const {
  data: { user },
} = await supabase.auth.getUser()
if (!user) throw new Error('User not authenticated')
```

## AI Feedback System (`src/services/ai/`)

| Module             | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| `api.ts`           | Gemini 2.5 Pro integration, structured JSON prompts      |
| `githubFetcher.ts` | Fetches repo code (prioritizes `src/` over config files) |
| `validation.ts`    | URL validation for GitHub/live site URLs                 |

Feedback stored in `challenge_feedback` table, linked to `challenge_submissions`.

## Git Conventions

- **Branch**: `feature/pf-[issue-number]-description` or `fix/pf-XX-description`
- **Commits**: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `docs`, `style`, `chore`
  - Example: `feat(challenges): add difficulty filter`

## Critical Gotchas

1. **Never edit `routeTree.gen.ts`** - auto-regenerates on `bun dev`
2. **Use `@/` alias** for all imports (configured in tsconfig)
3. **One auth listener** - `authSubscription.ts` handles it globally
4. **Supabase joins return arrays** - handle `.challenges` vs `.challenges[]`
5. **No `any` types** - use `unknown` with type guards, or add to `types/`
6. **Check user auth** before any protected Supabase mutation
