# PexFect - Frontend-Focused Coding Challenge Platform

## Project Overview
PexFect is a modern web application designed to help developers master frontend development through hands-on coding challenges. Built with React 19, TypeScript, and Supabase, it offers an interactive learning experience with real-time feedback and progress tracking.

## Tech Stack
- **Frontend Framework**: React 19.1.1 with Vite 7.1.1
- **Language**: TypeScript 5.9.2 (strict mode)
- **Routing**: TanStack Router 1.131.2 (file-based routing)
- **Backend**: Supabase 2.54.0 (auth, database, storage)
- **State Management**: TanStack Query 5.62.8
- **UI Components**: ShadCN UI with Radix primitives
- **Styling**: Tailwind CSS 3.5.0
- **Animations**: Framer Motion 12.0.1
- **Form Handling**: React Hook Form 7.54.2 + Zod 3.24.1
- **Package Manager**: Bun

## Architecture Patterns

### Directory Structure
```
src/
├── components/      # Reusable UI components (ShadCN)
├── layouts/        # Page layouts and navigation
├── lib/            # Utilities, configs, Supabase client
├── providers/      # Context providers
├── routes/         # TanStack Router file-based routes
├── services/       # Feature-based modules
│   ├── challenges/ # Challenge listing and details
│   ├── home/       # Landing page sections
│   ├── profile/    # User profile management
│   ├── resources/  # Learning resources
│   └── roadmap/    # Learning paths
├── styles/         # Global CSS and theme
└── types/          # TypeScript type definitions
```

### Service Module Pattern
Each service follows a consistent structure:
```
services/[feature]/
├── api.ts              # Supabase queries
├── index.ts            # Public exports
├── components/         # Feature-specific components
├── hooks/             # Custom React hooks
├── lib/               # Helper functions
└── utils/             # Utility functions
```

### Code Quality Standards

#### TypeScript
- Use strict type checking
- Avoid `any` - use proper types or `unknown`
- For Supabase operations, use type-safe helpers from `src/types/supabase.ts`
- Export types from domain-specific files in `src/types/`

#### React Best Practices
- React 19 uses automatic JSX transform - no need to import React
- Use hooks consistently (useState, useEffect, custom hooks)
- Implement proper error boundaries
- Use React.memo() for expensive components

#### Component Guidelines
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper TypeScript prop types
- Implement loading and error states

#### State Management
- Use TanStack Query for server state
- Use React Context for global UI state
- Keep local state close to where it's used
- Centralize query configurations in `src/lib/queryConfig.ts`

### Data Fetching
- All API calls go through service-specific `api.ts` files
- Use TanStack Query hooks for caching and state management
- Implement proper error handling and loading states
- Use optimistic updates where appropriate

### Styling
- Use Tailwind utility classes
- Follow mobile-first responsive design
- Use CSS custom properties for theming
- Keep component-specific styles in separate CSS files when needed

### Authentication
- Managed through Supabase Auth
- Use `src/lib/authSubscription.ts` for centralized auth state
- Implement proper route protection
- Handle auth errors gracefully

## Development Workflow

### Getting Started
```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Run linter
bun run lint

# Format code
bun run format
```

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
import { SupabaseTable } from '@/types/supabase';
import { supabase } from '@/lib/supabaseClient';

const { data, error } = await (supabase
  .from('table_name')
  .select('*') as SupabaseTable<MyType>);
```

### React Query Hook Pattern
```typescript
import { useQuery } from '@tanstack/react-query';
import { STALE_TIME, CACHE_VALIDITY } from '@/lib/queryConfig';

export const useFeature = () => {
  return useQuery({
    queryKey: ['feature'],
    queryFn: fetchFeature,
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_VALIDITY.LONG,
  });
};
```

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
