# PexFect

**PexFect** is a modern frontend web application built with React, TanStack Router, TanStack Query, Tailwind CSS (v4), ShadCN UI, Zustand, Zod, and Supabase. It features an advanced theming system, modular routing, efficient state and data management, and **AI-powered feedback** using Gemini 2.0 Flash Experimental.

---

## Features

- **React 19** with TypeScript for type-safe development
- **TanStack Router** for declarative, nested routing
- **TanStack Query** for server state management and caching
- **Tailwind CSS v4** with custom theming and dark mode support
- **ShadCN UI** components for a polished, accessible UI
- **Zustand** for lightweight client-side state management
- **Supabase** as a backend and authentication provider
- **AI Feedback System** with Gemini 2.0 Flash for automated challenge assessment
- **Submission History Tracking** with comparative analysis across attempts
- Modular project structure for scalability and maintainability

---

## AI Feedback System

PexFect includes a comprehensive AI feedback system that:

- ✅ **Generates detailed feedback** for challenge submissions using Gemini AI
- ✅ **Tracks submission history** and compares improvements over time
- ✅ **Provides structured analysis** across 6 key areas (design, code quality, functionality, accessibility)
- ✅ **Offers actionable recommendations** for next steps and learning resources
- ✅ **Monitors performance** with generation time tracking

### Quick Start

1. Set up environment variables in `.env.local`:

   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

2. View demo feedback UI:

   ```
   http://localhost:5000/feedback/demo
   ```

3. For full integration guide, see:
   - **[AI_FEEDBACK_INTEGRATION.md](./AI_FEEDBACK_INTEGRATION.md)** - Complete documentation
   - **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation details
   - **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Testing guide

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
 ┣ hooks/            # Custom React hooks
 ┣ layouts/          # Layout components (MainLayout, Navbar, Footer, etc...)
 ┣ lib/              # Utility functions, API clients (supabase, queryClient, etc...)
 ┣ providers/        # React context providers (QueryProvider, ThemeProvider, etc...)
 ┣ routes/           # Route components organized by feature
 ┣ services/         # Domain-specific services and stores
 ┃ ┣ ai/            # AI feedback generation service (Gemini integration)
 ┃ ┣ challenges/    # Challenge listing, details, submission logic
 ┃ ┣ feedback/      # Feedback display and data fetching
 ┃ ┣ profile/       # User profile management
 ┃ ┗ ...            # Other feature modules
 ┣ types/            # TypeScript type declarations
 ┣ test/             # Tests (if applicable)
 ┣ main.tsx          # Entry point
 ┣ index.css         # Global CSS including Tailwind imports and variables
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
