# PexFect

**PexFect** is a modern frontend coding challenge platform built with React 19, TanStack Router, TanStack Query, Tailwind CSS v4, ShadCN UI, Zustand, and Supabase. It features an advanced theming system, modular routing, efficient state and data management, and **AI-powered feedback** using Google Gemini 2.5 Flash.

---

## Features

- **React 19** with TypeScript for type-safe development
- **TanStack Router** for declarative, file-based routing with auto code-splitting
- **TanStack Query** for server state management and caching
- **Tailwind CSS v4** with custom theming and dark mode support
- **ShadCN UI** components for a polished, accessible UI
- **Zustand** for lightweight client-side state management
- **Supabase** as a backend and authentication provider
- **AI Feedback System** with Gemini 2.5 Flash for automated challenge assessment
- **Resubmission Tracking** with improvement comparison across attempts
- **Mismatch Detection** to catch wrong project submissions
- Modular project structure for scalability and maintainability

---

## AI Feedback System

PexFect includes a comprehensive AI feedback system that:

- ✅ **Generates detailed feedback** for challenge submissions using Gemini AI
- ✅ **Tracks submission history** and compares improvements over time
- ✅ **Detects mismatches** when wrong projects are submitted
- ✅ **Provides structured analysis** across 4 key areas (best practices, code formatting, functionality, accessibility)
- ✅ **Offers actionable recommendations** for next steps and learning resources
- ✅ **Priority-based code fetching** from GitHub (prioritizes src/ files over config)

### How It Works

1. **Submit**: User provides GitHub repo URL + live site URL
2. **Validate**: URLs are validated client-side and server-side
3. **Fetch**: System fetches source code from GitHub with smart prioritization
4. **Analyze**: Gemini AI analyzes code, design, and functionality
5. **Compare**: If resubmission, compares with previous feedback
6. **Display**: Structured feedback with scores and recommendations

### Quick Start

1. Set up environment variables in `.env.local`:

   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

2. For full documentation, see:
   - **[docs/PROJECT_DOCUMENTATION.md](./docs/PROJECT_DOCUMENTATION.md)** - Complete project documentation
   - **[docs/AI_FEEDBACK_SYSTEM.md](./docs/AI_FEEDBACK_SYSTEM.md)** - AI feedback system guide

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed (preferred package manager and runtime)
- Node.js (optional, if using npm/yarn instead)
- Supabase account with project set up
- Gemini API key (free tier available)

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

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
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

### Formatting and Linting

- Format all files using Biome:

  ```bash
  bun x biome format . --write
  ```

- Lint with Biome:

  ```bash
  bun x biome lint
  ```

---

## Project Structure

```
src/
 ┣ assets/           # Static assets (fonts, icons, images)
 ┣ components/       # Reusable UI components and primitives
 ┃ ┗ ui/            # ShadCN UI components
 ┣ layouts/          # Layout components (MainLayout, Navbar, Footer)
 ┣ lib/              # Utility functions, API clients (supabase, queryClient)
 ┣ providers/        # React context providers (QueryProvider, ThemeProvider)
 ┣ routes/           # TanStack Router file-based routes
 ┣ services/         # Domain-specific services (feature modules)
 ┃ ┣ ai/            # AI feedback generation (Gemini integration)
 ┃ ┣ challenges/    # Challenge listing, details, submission
 ┃ ┣ feedback/      # Feedback display, components, hooks
 ┃ ┣ home/          # Landing page components
 ┃ ┣ profile/       # User profile management
 ┃ ┣ resources/     # Learning resources
 ┃ ┗ roadmap/       # Learning paths
 ┣ styles/           # Global and feature-specific CSS
 ┣ types/            # TypeScript type declarations
 ┣ main.tsx          # Entry point
 ┗ index.css         # Global CSS with Tailwind imports
```

---

## Configuration

- **Theme management:** via `ThemeProvider` context wrapping your app
- **State management:** Zustand stores under `services/*/store.ts`
- **API calls:** handled in `services/*/api.ts` using Supabase client
- **Routing:** configured with TanStack Router in `routes/` and `routeTree.gen.ts`

---

## Tailwind CSS & Theming

- Tailwind CSS v4 configured with custom colors and dark mode in `index.css`
- Theme toggling supported via the `ThemeProvider` and `ModeToggle` UI component

---

## Documentation

For detailed documentation, see:

| Document | Description |
|----------|-------------|
| [Project Documentation](./docs/PROJECT_DOCUMENTATION.md) | Complete architecture, features, and API reference |
| [AI Feedback System](./docs/AI_FEEDBACK_SYSTEM.md) | AI feedback user guide and technical details |
| [Contributing](./CONTRIBUTING.md) | Contribution guidelines |

---

## License

This project is private and proprietary.
