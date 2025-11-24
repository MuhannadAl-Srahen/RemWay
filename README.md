# PexFect

**PexFect** is a modern frontend practice platform built with React 19, TanStack Router, TanStack Query, Tailwind CSS v4, ShadCN UI, and Supabase. It provides real-world coding challenges for frontend developers with AI-powered feedback, roadmaps, and progress tracking.

---

## Features

- **React 19** with TypeScript for type-safe development
- **TanStack Router** for file-based, type-safe routing with auto-generation
- **TanStack Query** for server state management and smart caching
- **Tailwind CSS v4** with custom theming and dark mode support via next-themes
- **ShadCN UI** components built on Radix UI for accessibility
- **Supabase** for backend, database, and GitHub OAuth authentication
- **Service-oriented architecture** with consistent patterns across features
- **Centralized type system** organized by domain for maintainability
- Modular project structure optimized for contributions

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed (preferred package manager and runtime)
- Node.js (optional, if using npm/yarn instead)

---

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/pexfect.git
   cd pexfect
   ```

2. Install dependencies with Bun:

   ```bash
   bun install
   ```

---

### Development

Run the development server with:

```bash
bun run dev
```

This will start Vite and open your app at `http://localhost:5000`.

---

### Build

To build the project for production:

```bash
bun run build
```

---

### Code Quality

- Format with Prettier:

  ```bash
  bun run format
  ```

- Check formatting:

  ```bash
  bun run check
  ```

- Lint with ESLint:

  ```bash
  bun run lint
  ```

---

## Project Structure

```
src/
 ┣ assets/           # Static assets (icons, images)
 ┣ components/ui/    # ShadCN UI components (Button, Card, Avatar, etc.)
 ┣ layouts/          # Layout components (MainLayout, Navbar, Footer, PageLayout, etc.)
 ┣ lib/              # Utilities (queryClient, supabase, scrollRestoration, etc.)
 ┣ providers/        # React context providers (AppProvider with theme/query)
 ┣ routes/           # TanStack Router file-based routes (auto-generates routeTree.gen.ts)
 ┣ services/         # Domain-specific services following consistent structure:
 ┃  ┣ service-name/
 ┃  ┃  ┣ api.ts          # Supabase queries and data fetching
 ┃  ┃  ┣ hooks/          # React Query hooks (useQuery/useMutation)
 ┃  ┃  ┣ components/     # Service-specific components
 ┃  ┃  ┣ lib/            # Utilities and helpers (optional)
 ┃  ┃  ┗ index.ts        # Public API exports
 ┣ types/            # Centralized TypeScript types organized by domain
 ┃  ┣ auth.ts           # Authentication and user types
 ┃  ┣ challenge.ts      # Challenge and submission types
 ┃  ┣ profile.ts        # User profile and stats types
 ┃  ┣ resource.ts       # Learning resource types
 ┃  ┣ roadmap.ts        # Learning path types
 ┃  ┣ feedback.ts       # Feedback and review types
 ┃  ┣ components.ts     # Component props types
 ┃  ┗ index.ts          # Re-exports all types (import from '@/types')
 ┣ main.tsx          # Application entry point
 ┗ index.css         # Global CSS with Tailwind v4 and theme variables
```

---

## Architecture

### Service Layer Pattern

Every service follows a consistent structure:

- **api.ts**: Supabase queries and data fetching functions
- **hooks/**: TanStack Query hooks wrapping API calls (useQuery/useMutation)
- **components/**: Feature-specific React components
- **lib/**: Utility functions and helpers (optional)
- **index.ts**: Public API re-exports

Example: `src/services/challenges/`

### Type System

All types are centralized in `src/types/` and organized by domain:

```typescript
// Always import from centralized location
import type { Challenge, UserProfile, ResourceItem } from '@/types'
```

### Routing

- **File-based routing**: Routes in `src/routes/` auto-generate route tree
- **Type-safe navigation**: Full TypeScript support for routes and params
- **Route definition**: Use `createFileRoute` to define routes

### State Management

- **Server state**: TanStack Query for async state with smart caching
- **Client state**: React hooks (useState, useContext) for local UI state
- **Auth state**: Managed via Supabase auth subscription in `useAuth` hook

### Theme System

- **Dark mode**: Powered by next-themes with system preference detection
- **Tailwind v4**: Custom theme configuration in `index.css`
- **Theme toggle**: Available in Navbar for desktop and mobile

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:

- Code structure and patterns
- Commit message conventions
- Pull request process
- Local development setup

---
