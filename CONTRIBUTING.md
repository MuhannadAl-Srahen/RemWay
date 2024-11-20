# Contributing to PexFect

Thank you for your interest in contributing to PexFect! This guide will help you get started with the codebase and understand our development patterns.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Structure](#code-structure)
- [Development Patterns](#development-patterns)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (preferred) or Node.js 18+
- Git
- GitHub account
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pexfect.git
   cd pexfect
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/pexfect.git
   ```

## Development Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start the development server:

   ```bash
   bun run dev
   ```

   The app will be available at `http://localhost:5000`

3. Run TypeScript checks:

   ```bash
   bun run build
   ```

4. Format and lint:
   ```bash
   bun run format  # Format with Prettier
   bun run check   # Check formatting
   bun run lint    # Lint with ESLint
   ```

## Code Structure

### Service Layer Pattern

**Every service MUST follow this structure:**

```
src/services/service-name/
├── api.ts              # Supabase queries and data fetching
├── hooks/              # React Query hooks (useQuery/useMutation)
├── components/         # Service-specific components
├── lib/                # Utilities and helpers (optional)
└── index.ts            # Re-export public API
```

**Example:**

```typescript
// src/services/challenges/api.ts
export const getChallenges = async () => {
  const { data, error } = await supabase.from('challenges').select('*')
  if (error) throw error
  return data
}

// src/services/challenges/hooks/useChallenges.ts
import { useQuery } from '@tanstack/react-query'
import { getChallenges } from '../api'

export const useChallenges = () => {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: getChallenges,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// src/services/challenges/index.ts
export * from './hooks/useChallenges'
export * from './components/ChallengeCard'
```

### Type System

**All types are centralized in `src/types/` and organized by domain:**

```
src/types/
├── index.ts           # Re-exports all types
├── auth.ts            # Authentication types
├── challenge.ts       # Challenge types
├── profile.ts         # User profile types
├── resource.ts        # Resource types
├── roadmap.ts         # Learning path types
├── feedback.ts        # Feedback types
└── components.ts      # Component props
```

**ALWAYS import from `@/types`** (never from subdirectories):

```typescript
// ✅ Correct
import type { Challenge, UserProfile, ResourceItem } from '@/types'

// ❌ Wrong
import type { Challenge } from '@/types/challenge'
```

### Routing with TanStack Router

Routes are file-based in `src/routes/`:

```typescript
// src/routes/challenges/$id/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/challenges/$id/')({
  component: ChallengeDetail,
})

function ChallengeDetail() {
  const { id } = Route.useParams() // Type-safe params
  // ...
}
```

The route tree is auto-generated in `src/routeTree.gen.ts` - **never edit this file manually**.

## Development Patterns

### 1. Data Fetching with TanStack Query

```typescript
// api.ts - Direct Supabase queries
export const getChallenge = async (id: string) => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// hooks/useChallenge.ts - Wrap with useQuery
export const useChallenge = (id: string) => {
  return useQuery({
    queryKey: ['challenge', id],
    queryFn: () => getChallenge(id),
    staleTime: 1000 * 60 * 5,
  })
}
```

### 2. Type Safety

```typescript
// Define types in src/types/
export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  thumbnail_url?: string
}

// Use in components
function ChallengeCard({ challenge }: { challenge: Challenge }) {
  // Fully typed props
}
```

### 3. Styling with Tailwind CSS v4

```tsx
import { cn } from '@/lib/utils'

function Component({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'base-classes here',
        'responsive-classes md:something',
        className // Allow override
      )}
    >
      Content
    </div>
  )
}
```

### 4. Component Organization

- **UI Components**: `src/components/ui/` (ShadCN components)
- **Layout Components**: `src/layouts/` (Navbar, Footer, etc.)
- **Service Components**: `src/services/[service]/components/` (feature-specific)

### 5. Error Handling

```typescript
// In API functions
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
  return data
} catch (error) {
  console.error('[getFunctionName] Error:', error)
  return null // Graceful degradation
}

// In React Query hooks
const { data, error, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
  retry: (failureCount, error) => {
    // Don't retry auth errors
    if (error.message?.includes('JWT')) return false
    return failureCount < 3
  },
})
```

## Commit Guidelines

We use conventional commits for clear history:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(challenges): add difficulty filter to challenges page

- Add difficulty dropdown component
- Implement filter logic in useChallenges hook
- Update route to accept difficulty query param

Closes #123
```

```bash
fix(navbar): resolve mobile menu not closing on navigation

The mobile menu wasn't closing when users clicked navigation links.
Fixed by adding onClick handler to close menu on route change.

Fixes #456
```

## Pull Request Process

1. **Create a feature branch:**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following the patterns above

3. **Test your changes:**

   ```bash
   bun run build  # TypeScript check
   bun run format # Format code
   bun run lint   # Lint check
   ```

4. **Commit with conventional commits:**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to your fork:**

   ```bash
   git push origin feat/your-feature-name
   ```

6. **Open a Pull Request:**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure all checks pass

### PR Checklist

- [ ] Code follows project structure and patterns
- [ ] Types are properly defined in `src/types/`
- [ ] Services follow standard structure (api.ts, hooks/, etc.)
- [ ] Components use proper TypeScript types
- [ ] Code is formatted (`bun run format`)
- [ ] No TypeScript errors (`bun run build`)
- [ ] Meaningful commit messages
- [ ] PR description explains changes clearly

## Questions?

If you have questions or need help:

1. Check existing [Issues](https://github.com/ORIGINAL_OWNER/pexfect/issues)
2. Review this guide and the [README](./README.md)
3. Open a new issue with the `question` label

Thank you for contributing to PexFect! 🚀
