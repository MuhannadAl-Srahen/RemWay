# PexFect - Complete Project Documentation

A modern frontend coding challenge platform built to help developers master frontend development through hands-on practice, AI-powered feedback, and structured learning paths.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Manual](#user-manual)
3. [Complete Feature Guide](#complete-feature-guide)
4. [Getting Started (Developers)](#getting-started-developers)
5. [Architecture](#architecture)
6. [Tech Stack](#tech-stack)
7. [Project Structure](#project-structure)
8. [Core Modules](#core-modules)
9. [Database Schema](#database-schema)
10. [Authentication](#authentication)
11. [State Management](#state-management)
12. [Routing](#routing)
13. [Styling](#styling)
14. [Configuration](#configuration)
15. [Deployment](#deployment)
16. [Contributing](#contributing)

---

## Project Overview

### What is PexFect?

PexFect is a web-based platform where developers can:

- **Practice** frontend development through curated coding challenges
- **Submit** their solutions with GitHub repositories and live URLs
- **Receive** AI-powered feedback on code quality, design accuracy, and best practices
- **Track** their progress through structured learning paths
- **Learn** from curated resources and recommendations

### Target Audience

- **Beginners** learning HTML, CSS, and JavaScript
- **Intermediate** developers mastering React and modern frameworks
- **Advanced** developers preparing for production-ready code

### Key Differentiators

| Feature               | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| **AI Feedback**       | Gemini-powered code review with specific, actionable suggestions |
| **Real Projects**     | Build actual projects, not toy examples                          |
| **Progress Tracking** | Structured learning paths with milestones                        |
| **Design-First**      | Figma designs provided for each challenge                        |
| **Resubmission**      | Improve your score based on previous feedback                    |
| **Consistent Scoring**| Deterministic AI ensures same code = same score                  |

---

## User Manual

This section explains how to use every feature of PexFect as an end user.

### 🏠 Home Page

**URL:** `/`

The home page introduces PexFect and its features:

1. **Hero Section** - Welcome message and main call-to-action
2. **Features** - Overview of platform capabilities
3. **How It Works** - Step-by-step guide
4. **Featured Challenges** - Popular challenges to get started
5. **Call to Action** - Sign up prompt

**Actions Available:**
- Click "Get Started" to browse challenges
- Click "Sign In" to authenticate with GitHub

---

### 🎯 Challenges

**URL:** `/challenges`

Browse all available frontend coding challenges.

#### Viewing Challenges

1. **Grid View** - Card-based layout showing challenge thumbnails
2. **List View** - Compact list format for quick scanning
3. **Toggle** - Switch between views using the view toggle button

#### Filtering Challenges

| Filter       | Options                              | Purpose                        |
| ------------ | ------------------------------------ | ------------------------------ |
| **Difficulty** | Beginner, Intermediate, Advanced   | Filter by skill level          |
| **Category** | Components, Layouts, Forms, etc.     | Filter by challenge type       |
| **Search**   | Text input                           | Search by title or description |

#### Challenge Card Information

Each challenge card shows:
- **Thumbnail** - Preview image of the design
- **Title** - Challenge name
- **Difficulty** - Color-coded badge (Green/Yellow/Red)
- **Category** - Challenge type
- **Estimated Time** - How long it typically takes
- **Save Button** - Bookmark for later (requires sign-in)

#### Saving Challenges

1. Click the bookmark icon on any challenge card
2. If not signed in, you'll be prompted to sign in
3. Saved challenges appear in your profile

---

### 📋 Challenge Detail Page

**URL:** `/challenges/:id`

View complete details for a specific challenge.

#### Sections

1. **Hero Section**
   - Challenge title and difficulty
   - Category and estimated time
   - Figma design access button
   - Save/bookmark button

2. **Overview Tab**
   - Challenge description
   - Learning outcomes (what you'll learn)
   - Requirements checklist
   - Technical specifications

3. **Design Tab**
   - Embedded Figma preview
   - Design access type (View/Edit)
   - Download design assets button

4. **Resources Tab**
   - Starter files download
   - Asset files (images, icons)
   - Helpful documentation links

5. **Submit Tab** (Requires Sign-In)
   - Submission form for your solution

#### Submitting a Solution

**Prerequisites:**
- ✅ Signed in with GitHub
- ✅ Public GitHub repository with your code
- ✅ Live deployed site

**Steps:**

1. **Navigate to Submit Tab**
   - Scroll down or click "Submit Solution"

2. **Enter GitHub Repository URL**
   ```
   Format: https://github.com/username/repository-name
   ```
   - Must be YOUR repository (ownership verified)
   - Must be PUBLIC (checked before submission)
   - Real-time validation shows ✓ or error

3. **Enter Live Site URL**
   ```
   Format: https://your-site.vercel.app
   ```
   - Must be accessible
   - Cannot be localhost
   - Real-time validation shows ✓ or error

4. **Upload Screenshot (Optional)**
   - Drag & drop or click to upload
   - Max 10MB, PNG/JPG format
   - Shows preview after upload

5. **Click "Submit for AI Review"**
   - Button shows "Checking Repository..." briefly
   - Then "Analyzing Solution..." during submission
   - Redirects to feedback page automatically

**Validation Messages:**

| Issue | Error Message | Solution |
|-------|---------------|----------|
| Private repo | "Repository must be public" | Change repo to public in GitHub settings |
| Invalid GitHub URL | "Must be a valid GitHub URL" | Use format: github.com/user/repo |
| Invalid live URL | "Must be a valid URL" | Ensure https:// prefix |
| Someone else's repo | "You can only submit your own repos" | Use a repo from your GitHub account |
| Already used URL | "URL already used for another challenge" | Use unique URLs per challenge |

---

### 📊 Feedback Page

**URL:** `/feedback/:submissionId`

View AI-generated feedback for your submission.

#### Loading States

1. **Initial Load** - Skeleton loading animation
2. **Processing** - "Analyzing your submission..." with animated indicator
3. **Complete** - Full feedback displayed
4. **Timeout** - "Taking longer than expected" with retry button
5. **Error** - Error message with retry option

#### Feedback Sections

1. **Header**
   - Overall score (0-100)
   - Rating badge (Excellent/Good/Needs Improvement)
   - Challenge name and thumbnail
   - Links to view code and live preview

2. **Score Breakdown** (if available)
   - Design Implementation: X/30
   - Code Quality: X/30
   - Functionality: X/25
   - Accessibility: X/15

3. **What You Did Well** ✅
   - 3-5 positive points about your submission
   - Encouragement for good practices

4. **Areas for Improvement** 📈
   - 3-5 actionable suggestions
   - Specific code/design improvements

5. **Design Comparison**
   - How well your implementation matches the design
   - Notes on visual accuracy, responsiveness

6. **Technical Analysis**
   - **Best Practices** - Code organization, patterns
   - **Code Formatting** - Style, naming, structure
   - **Functionality** - Features, error handling
   - **Accessibility** - Semantic HTML, ARIA, keyboard nav

7. **Recommendations**
   - **Next Challenges** - Suggested challenges based on skill level
   - **Learning Resources** - Articles, tutorials, documentation

8. **Improvements from Previous** (Resubmissions only)
   - Issues you fixed ✅
   - Issues still to address ❌
   - Score change (+X or -X points)

#### Warning Banners

| Banner | Meaning | Action |
|--------|---------|--------|
| **Wrong Project** | You submitted code for a different challenge | Resubmit with correct repository |
| **Code Not Available** | GitHub code couldn't be fetched | Make sure repo is public |
| **Validation Error** | URLs are invalid | Check your URLs and resubmit |

#### Actions

- **View Code** - Opens GitHub repository
- **View Live Site** - Opens deployed preview
- **Back to Challenge** - Return to challenge page
- **Resubmit** - Submit an improved version

---

### 🗺️ Learning Paths (Roadmap)

**URL:** `/roadmap`

Structured learning paths from beginner to advanced.

#### Available Paths

| Path | Duration | Focus Areas |
|------|----------|-------------|
| **Beginner** | 2-3 weeks | HTML, CSS, JavaScript basics |
| **Intermediate** | 2-4 weeks | React, APIs, State management |
| **Advanced** | 3-5 weeks | TypeScript, Performance, Architecture |

#### Path Card Information

- Path name and icon
- Brief description
- Duration estimate
- Number of challenges
- Your progress (if started)

#### Starting a Path

1. **Click on a Path Card** to view details
2. **If not started:**
   - See path overview and challenges
   - Click "Start This Path" button
3. **Confirmation Dialog:**
   - If you have another path in progress, you'll be warned
   - Confirm to start the new path
4. **If not signed in:**
   - Prompted to sign in with GitHub

---

### 📚 Path Detail Page

**URL:** `/roadmap/:pathId`

View all challenges in a learning path.

#### Path Header

- Path name and icon
- Description
- Duration and challenge count
- Start/Continue button
- Progress bar (if started)

#### Challenge List

Challenges displayed in order with:

1. **Challenge Number** - Sequence in path
2. **Thumbnail** - Challenge preview
3. **Title and Description**
4. **Difficulty Badge**
5. **Lock/Unlock Status**
   - 🔓 **Unlocked** - Can be started
   - 🔒 **Locked** - Complete previous challenge first

#### Challenge Unlock Rules

| Condition | Status |
|-----------|--------|
| Haven't started path | All challenges locked |
| Started path | First challenge unlocked |
| Completed challenge N | Challenge N+1 unlocked |
| Completed all challenges | Path marked complete |

#### Progress Tracking

- Progress percentage shown in header
- Completed challenges marked with ✓
- Current challenge highlighted

---

### 📖 Resources

**URL:** `/resources`

Curated learning resources for frontend development.

#### Resource Categories

| Category | Description |
|----------|-------------|
| **Documentation** | Official docs (MDN, React, etc.) |
| **Tutorials** | Step-by-step guides |
| **Tools** | Development tools and utilities |
| **Communities** | Forums, Discord, Stack Overflow |
| **Courses** | Online learning platforms |

#### Resource Card Information

- Title and description
- Resource type badge
- Category
- External link button

#### Filtering Resources

- Filter by category
- Filter by type
- Search by keyword

---

### 👤 Profile Page

**URL:** `/profile`

View and manage your user profile.

#### Profile Sections

1. **Profile Header**
   - Avatar (from GitHub)
   - Display name
   - Username
   - Bio
   - Location

2. **Statistics**
   - Challenges completed
   - Current streak
   - Total points
   - Rank/level

3. **Social Links**
   - GitHub (auto-linked)
   - Twitter/X
   - LinkedIn
   - Personal website

4. **Activity Feed**
   - Recent submissions
   - Challenges started
   - Achievements unlocked

5. **Saved Challenges**
   - Bookmarked challenges
   - Quick access to continue

#### Actions

- **Edit Profile** - Go to settings
- **View Submission** - Click on any activity item
- **Remove Saved Challenge** - Click bookmark to unsave

---

### ⚙️ Settings Page

**URL:** `/settings`

Manage your account settings.

#### Editable Fields

| Field | Description |
|-------|-------------|
| **Display Name** | Your public name |
| **Username** | Unique identifier (may be limited) |
| **Bio** | Short description about yourself |
| **Location** | Your city/country |
| **Website** | Personal website URL |
| **Twitter** | Twitter/X username |
| **LinkedIn** | LinkedIn profile URL |

#### Actions

- **Save Changes** - Update your profile
- **Sign Out** - Log out of your account

---

### 📈 Progress Page

**URL:** `/progress`

Track your overall learning progress.

#### Progress Overview

- Total challenges completed
- Points earned
- Current learning path
- Completion percentage

#### Progress by Path

Each learning path shows:
- Progress bar
- Challenges completed / total
- Time spent (estimated)

#### Recent Activity

Timeline of:
- Submissions made
- Feedback received
- Challenges completed
- Paths started/completed

---

### 🔐 Authentication

#### Sign In

1. Click "Sign In" button (top-right)
2. Click "Sign In with GitHub"
3. Authorize PexFect on GitHub
4. Redirected back to the page you were on

#### Sign Out

1. Click your avatar (top-right)
2. Click "Sign Out"
3. Redirected to home page

#### What's Linked from GitHub

- **Avatar** - Your GitHub profile picture
- **Username** - Your GitHub username
- **Email** - For notifications (private)

---

## Complete Feature Guide

### Feature Matrix

| Feature | Guest | Signed In | Description |
|---------|-------|-----------|-------------|
| Browse challenges | ✅ | ✅ | View all challenges |
| View challenge details | ✅ | ✅ | See requirements, design |
| Submit solution | ❌ | ✅ | Requires authentication |
| View feedback | ❌ | ✅ | Your submissions only |
| Save challenges | ❌ | ✅ | Bookmark for later |
| View roadmap | ✅ | ✅ | Browse learning paths |
| Start a path | ❌ | ✅ | Track progress |
| View resources | ✅ | ✅ | All resources public |
| Edit profile | ❌ | ✅ | Manage your info |
| View progress | ❌ | ✅ | Track achievements |

### Submission System Details

#### URL Validation Rules

**GitHub Repository URL:**
- Must start with `https://github.com/`
- Must contain owner and repo name
- Must be owned by the signed-in user
- Must be public (verified via GitHub API)

**Live Site URL:**
- Must start with `http://` or `https://`
- Cannot be `localhost` or `127.0.0.1`
- Should be accessible (not verified, but checked by AI)

#### Ownership Verification

The system verifies:
1. Your GitHub username (from OAuth)
2. Repository owner in the URL
3. They must match

Example:
- Signed in as: `johndoe`
- Valid URL: `https://github.com/johndoe/my-project`
- Invalid URL: `https://github.com/someone-else/their-project`

#### Duplicate Prevention

| Scenario | Behavior |
|----------|----------|
| Same URL, same challenge | Updates existing submission |
| Same URL, different challenge | Error: "URL already used" |
| Different user's URL | Error: "Can only submit your own repos" |
| Official challenge URL | Error: "Cannot submit official solution" |

#### Resubmission Flow

1. Update code on GitHub
2. Go back to challenge page
3. Submit with same URLs
4. System detects code change (timestamp comparison)
5. Old feedback deleted, new feedback generated
6. New feedback shows comparison with previous

### AI Feedback System

#### Scoring Categories

| Category | Points | What's Evaluated |
|----------|--------|------------------|
| Design | 30 | Visual accuracy, responsiveness, UI/UX |
| Code Quality | 30 | Structure, naming, best practices |
| Functionality | 25 | Features work, error handling |
| Accessibility | 15 | Semantic HTML, ARIA, keyboard |

#### Rating Thresholds

| Score | Rating | Meaning |
|-------|--------|---------|
| 90-100 | Excellent | Production-ready code |
| 75-89 | Good | Solid implementation |
| 60-74 | Needs Improvement | Core works, has issues |
| Below 60 | Poor | Significant problems |
| 0-20 | Mismatch/Error | Wrong project or validation error |

#### Consistency Guarantee

The AI uses deterministic settings:
- **temperature: 0** - No randomness
- **topK: 1** - Most likely response
- **topP: 1** - No sampling variance

**Result:** Same code → Same score (every time)

### Learning Path System

#### Path Progression

```
Not Started → Started → In Progress → Completed
     │            │           │            │
     └── Start ───┴── Complete challenges ─┘
```

#### Challenge Unlocking

```
Path Started?
    │
    ├── No → All challenges LOCKED
    │
    └── Yes → First challenge UNLOCKED
                    │
              Complete it
                    │
                    ▼
              Next challenge UNLOCKED
                    │
              (repeat until done)
                    │
                    ▼
              Path COMPLETE! 🎉
```

#### Progress Calculation

```
Progress % = (Completed Challenges / Total Challenges) × 100
```

---

## Getting Started (Developers)

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Supabase** account with a project
- **Gemini API** key (free tier available)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/MuhannadAl-Srahen/PexFect.git
cd PexFect

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI (Required for feedback)
VITE_GEMINI_API_KEY=your-gemini-api-key

# GitHub Token (Optional - increases rate limits)
VITE_GITHUB_TOKEN=your-github-pat
```

### Development

```bash
# Start development server (runs on port 5000)
bun dev

# Build for production
bun run build

# Preview production build
bun run preview

# Format code
bun run format

# Lint code
bun run lint
```

---

## Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (React 19)                        │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Routes  │  │  Services│  │Components│  │    Providers     │ │
│  │(TanStack)│  │ (Domain) │  │(ShadCN)  │  │(Query + Theme)   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                  │           │
│       └─────────────┴─────────────┴──────────────────┘           │
│                              │                                    │
├──────────────────────────────┼────────────────────────────────────┤
│                         STATE LAYER                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  TanStack Query │  │      Zustand     │  │  React State    │  │
│  │  (Server State) │  │  (Client State)  │  │  (Local State)  │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬────────┘  │
│           │                    │                      │           │
├───────────┴────────────────────┴──────────────────────┴───────────┤
│                          API LAYER                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │    Supabase     │  │   GitHub API     │  │   Gemini AI     │  │
│  │  (DB + Auth)    │  │  (Code Fetch)    │  │  (Feedback)     │  │
│  └─────────────────┘  └──────────────────┘  └─────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component → Hook → Service API → External API/Supabase
                                       ↓
                              TanStack Query Cache
                                       ↓
                              Component Re-render
```

---

## Tech Stack

### Frontend Framework

| Technology     | Version | Purpose                                   |
| -------------- | ------- | ----------------------------------------- |
| **React**      | 19.2.0  | UI framework with automatic JSX transform |
| **TypeScript** | 5.9.3   | Type safety with strict mode              |
| **Vite**       | 7.2.4   | Build tool with HMR                       |

### Routing & State

| Technology          | Version | Purpose                                |
| ------------------- | ------- | -------------------------------------- |
| **TanStack Router** | 1.139.3 | File-based routing with code-splitting |
| **TanStack Query**  | 5.90.10 | Server state management                |
| **TanStack Form**   | 1.25.0  | Form handling with validation          |
| **Zustand**         | 5.0.8   | Client state management                |

### UI & Styling

| Technology       | Version  | Purpose                                 |
| ---------------- | -------- | --------------------------------------- |
| **Tailwind CSS** | 4.1.17   | Utility-first styling (via Vite plugin) |
| **ShadCN UI**    | 0.9.5    | Radix-based component library           |
| **Radix UI**     | Various  | Accessible primitives                   |
| **Lucide React** | 0.539.0  | Icon library                            |
| **Motion**       | 12.23.24 | Animation library                       |

### Backend & APIs

| Technology     | Version | Purpose                 |
| -------------- | ------- | ----------------------- |
| **Supabase**   | 2.84.0  | Database, Auth, Storage |
| **Gemini AI**  | 0.24.1  | AI feedback generation  |
| **GitHub API** | REST v3 | Code fetching           |

---

## Project Structure

```
pexfect/
├── public/                    # Static assets
├── docs/                      # Documentation
│   ├── AI_FEEDBACK_SYSTEM.md  # AI system documentation
│   └── PROJECT_DOCUMENTATION.md # This file
├── scripts/                   # Utility scripts
├── src/
│   ├── assets/               # Images, icons
│   ├── components/           # Shared UI components
│   │   └── ui/              # ShadCN components
│   ├── layouts/             # Page layouts
│   ├── lib/                 # Utilities and config
│   ├── providers/           # React context providers
│   ├── routes/              # TanStack Router pages
│   ├── services/            # Feature modules
│   ├── styles/              # CSS files
│   ├── types/               # TypeScript definitions
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── .env.local               # Environment variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Service Module Pattern

Each service follows a consistent structure:

```
services/[feature]/
├── api.ts              # Database queries and mutations
├── index.ts            # Public exports
├── components/         # Feature-specific components
├── hooks/              # Custom React hooks
└── lib/                # Helper utilities
```

**Import Rule:** Always import from service index:

```typescript
// ✅ Correct
import { ChallengeGridItem, useChallenges } from '@/services/challenges'

// ❌ Avoid deep imports
import { ChallengeGridItem } from '@/services/challenges/components/ChallengeGridItem'
```

---

## Database Schema

### Core Tables

#### `profiles`
User profile information linked to auth.

#### `challenges`
All available coding challenges.

#### `challenge_submissions`
User submissions with GitHub and live URLs.

#### `challenge_feedback`
AI-generated feedback with unique constraint per submission.

#### `saved_challenges`
User bookmarks for challenges.

---

## Authentication

PexFect uses **Supabase Auth** with GitHub OAuth.

### Flow

1. User clicks "Sign In with GitHub"
2. Redirected to GitHub OAuth
3. User authorizes the app
4. Redirected back with session
5. Profile created/updated

---

## State Management

### Server State (TanStack Query)

For all data from APIs with caching and refetching.

### Client State (Zustand)

For UI state like filters and preferences.

### Local State (useState)

For component-specific state.

---

## Routing

File-based routing with TanStack Router:

```
routes/
├── __root.tsx           → Layout wrapper
├── index.tsx            → /
├── profile.tsx          → /profile
├── progress.tsx         → /progress
├── challenges/
│   ├── index.tsx        → /challenges
│   └── $id/
│       └── index.tsx    → /challenges/:id
├── feedback/
│   └── $submissionId.tsx → /feedback/:submissionId
├── resources/
│   └── index.tsx        → /resources
├── roadmap/
│   ├── index.tsx        → /roadmap
│   └── $pathId/
│       └── index.tsx    → /roadmap/:pathId
└── settings/
    └── index.tsx        → /settings
```

---

## Styling

### Tailwind CSS v4

Configured via Vite plugin with CSS custom properties for theming.

### Theme System

Using `next-themes` for dark mode support.

---

## Configuration

### Vite Configuration

Includes TanStack Router, React, and Tailwind plugins with manual chunking for optimal bundle sizes.

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

**Build Settings:**
- Framework: Vite
- Build Command: `bun run build`
- Output Directory: `dist`

---

## Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/pf-XX-description`
2. Make changes following code patterns
3. Run linter: `bun run lint`
4. Format code: `bun run format`
5. Build: `bun run build`
6. Create pull request

### Commit Convention

```
type(scope): description

Types: feat, fix, refactor, docs, style, test, chore
```

---

_Last updated: November 2025_
