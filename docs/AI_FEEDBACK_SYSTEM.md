# AI Feedback System

PexFect uses AI-powered feedback to provide detailed, actionable code reviews for frontend challenge submissions. This document covers everything you need to know about how the system works, how to use it, and how to troubleshoot issues.

---

## Table of Contents

1. [Overview](#overview)
2. [User Guide](#user-guide)
3. [How It Works](#how-it-works)
4. [Architecture](#architecture)
5. [Key Features](#key-features)
6. [Configuration](#configuration)
7. [Database Schema](#database-schema)
8. [Service Structure](#service-structure)
9. [Error Handling](#error-handling)
10. [Troubleshooting](#troubleshooting)
11. [Performance](#performance)
12. [Recent Updates](#recent-updates)

---

## Overview

The AI Feedback System analyzes user submissions by:

1. **Validating URLs** before processing (client + server side)
2. **Checking repository visibility** - ensures GitHub repo is public before submission
3. **Fetching source code** from GitHub repositories with priority-based file selection, timeout handling, and retry logic
4. **Comparing with previous submissions** to track improvement over time
5. **Generating structured feedback** covering code quality, design accuracy, and accessibility
6. **Detecting mismatches** when wrong projects are submitted
7. **Detecting stale feedback** and auto-regenerating when code is updated

### Tech Stack

- **AI Model**: Google Gemini 2.5 Pro (`gemini-2.5-pro`) with deterministic settings
- **Code Fetching**: GitHub REST API v3 with priority-based file selection, parallel fetching, and retry logic
- **Database**: Supabase PostgreSQL with Row Level Security
- **Frontend**: React 19 + TanStack Query + TanStack Router
- **Validation**: Custom URL validators with real-time feedback

---

## User Guide

### Step 1: Complete a Challenge

1. Browse available challenges at `/challenges`
2. Click on a challenge to view its details
3. Review the design requirements and technical specifications
4. Build your solution following the requirements

### Step 2: Deploy Your Solution

Before submitting, you need:

| Requirement           | Description                                                | Examples                                                          |
| --------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| **GitHub Repository** | Your source code must be **publicly accessible** on GitHub | `https://github.com/username/my-project`                          |
| **Live Site URL**     | Your project must be deployed and accessible online        | `https://my-project.vercel.app`, `https://my-project.netlify.app` |

> ⚠️ **Important**: Your GitHub repository **must be public**. Private repositories cannot be analyzed by the AI. The system will check this before allowing submission.

**Recommended Deployment Platforms:**

- [Vercel](https://vercel.com) - Best for React/Next.js projects
- [Netlify](https://netlify.com) - Great for static sites
- [GitHub Pages](https://pages.github.com) - Free for public repos
- [Cloudflare Pages](https://pages.cloudflare.com) - Fast global CDN

### Step 3: Submit Your Solution

1. Navigate to the challenge page
2. Scroll down to the "Submit Your Solution" section
3. Enter your **GitHub Repository URL**:
   - Must be a valid GitHub URL (e.g., `https://github.com/username/repo`)
   - Repository **must be public** for code analysis
   - Real-time validation shows if URL is valid
4. Enter your **Live Site URL**:
   - Must be a valid HTTP/HTTPS URL
   - Cannot be localhost
   - Site must be accessible
5. (Optional) Upload a screenshot of your solution
6. Click **"Submit for AI Review"**

### Step 4: Wait for AI Analysis

After submission:

1. You'll be redirected to the feedback page
2. The system shows "Analyzing your submission..." while processing
3. AI analysis typically takes **20-60 seconds**
4. The page auto-refreshes when feedback is ready
5. If it takes longer than 2 minutes, you'll see a timeout message with retry option

### Step 5: Review Your Feedback

Your feedback includes:

| Section                   | Description                               |
| ------------------------- | ----------------------------------------- |
| **Overall Score**         | 0-100 score based on all criteria         |
| **Score Breakdown**       | Points for Design, Code, Function, A11y   |
| **What You Did Well**     | 3-5 positive achievements                 |
| **Areas for Improvement** | 3-5 actionable suggestions                |
| **Design Comparison**     | How well your design matches requirements |
| **Technical Analysis**    | Detailed breakdown by category            |
| **Recommendations**       | Next challenges and learning resources    |

### Step 6: Resubmit After Making Changes

If you want to improve your score:

1. **Update your code** on GitHub (commit and push changes)
2. Go back to the challenge page
3. Submit again with the **same URLs**
4. The system detects your code was updated and **generates fresh feedback**
5. You'll see an **"Improvements from Previous"** section showing:
   - Which issues you fixed ✅
   - Which issues still need work ❌
   - Your score improvement

> 💡 **Note**: The system compares timestamps. If you update your code and resubmit, new feedback will be generated automatically. If you submit without changes, you'll see your existing feedback (consistent scoring).

---

## How It Works

### Submission Flow

```
User clicks "Submit"
        │
        ▼
┌─────────────────────────────┐
│  Client-side Validation     │
│  - GitHub URL format        │
│  - Live Site URL format     │
└───────────┬─────────────────┘
            │ Valid
            ▼
┌─────────────────────────────┐
│  Check Repository Visibility│
│  (Must be PUBLIC)           │
└───────────┬─────────────────┘
            │ Public
            ▼
┌─────────────────────────────┐
│  Store in Database          │
│  - Update submitted_at      │
│  - Link to previous if any  │
└───────────┬─────────────────┘
            │
            ▼
┌─────────────────────────────┐
│  Clear Feedback Cache       │
│  (Prevent stale data)       │
└───────────┬─────────────────┘
            │
            ▼
┌─────────────────────────────┐
│  Navigate to Feedback Page  │
│  /feedback/:submissionId    │
└───────────┬─────────────────┘
            │
            ▼
┌─────────────────────────────┐
│  Check Feedback Status      │
│  - Exists & up-to-date?     │
│  - Stale? Regenerate        │
│  - Missing? Generate new    │
└───────────┬─────────────────┘
            │
            ▼
┌──────────────────────────────────────────┐
│  Fetch GitHub Code (Parallel + Retry)    │
│  - 15 second timeout per request         │
│  - Up to 3 retries with 1s delay         │
│  - 5 files fetched in parallel           │
│  Priority:                               │
│  1. src/*.jsx, src/*.tsx (priority 0)    │
│  2. *.html, *.css (priority 5)           │
│  3. package.json (priority 10)           │
│  4. Config files (priority 15-20)        │
└───────────┬──────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│  Send to Gemini AI          │
│  - Deterministic settings   │
│  - temperature: 0           │
│  - Scoring rubric enforced  │
└───────────┬─────────────────┘
            │
            ▼
┌─────────────────────────────┐
│  Parse AI Response          │
│  - JSON validation          │
│  - Truncation repair        │
└───────────┬─────────────────┘
            │
            ▼
┌─────────────────────────────┐
│  Store Feedback in DB       │
│  - Unique per submission    │
│  - Delete old if stale      │
└───────────┬─────────────────┘
            │
            ▼
┌─────────────────────────────┐
│  Display to User            │
│  (Polling detects it)       │
└─────────────────────────────┘
```

### Stale Feedback Detection

The system intelligently handles code updates:

```
┌─────────────────────────────────────────────────────────┐
│                  SUBMISSION TIMELINE                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ──────────────────────────────────────────────────▶    │
│      │                    │                    │        │
│   Submit              Feedback            Resubmit      │
│   Code v1             Generated           Code v2       │
│      │                    │                    │        │
│  submitted_at         created_at          submitted_at  │
│  = T1                 = T2                = T3          │
│                                                         │
│  IF T2 >= T1: Feedback is UP-TO-DATE (show existing)    │
│  IF T2 < T3:  Feedback is STALE (regenerate new)        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Priority-Based File Fetching

The system intelligently prioritizes which files to fetch from GitHub:

| Priority    | File Pattern                   | Examples                                 |
| ----------- | ------------------------------ | ---------------------------------------- |
| 0 (Highest) | `src/**/*.jsx`, `src/**/*.tsx` | `src/App.jsx`, `src/components/Card.tsx` |
| 1           | `src/**/*.js`, `src/**/*.ts`   | `src/utils.js`, `src/hooks.ts`           |
| 2           | `src/**/*.css`                 | `src/styles.css`, `src/App.css`          |
| 3           | Other `src/` files             | `src/index.html`                         |
| 4-5         | `components/` folder           | `components/Button.jsx`                  |
| 6-9         | Root source files              | `index.html`, `style.css`                |
| 10-13       | Config & docs                  | `package.json`, `README.md`              |
| 20 (Lowest) | Other files                    | `.gitignore`, `LICENSE`                  |

**Limits:**

- Maximum **15 files** analyzed per submission
- Files larger than **50KB** are skipped
- Total code size capped at **100KB**
- Excluded directories: `node_modules/`, `dist/`, `build/`, `.git/`, `vendor/`, `.next/`, `coverage/`

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Submits   │────▶│  URL Validation  │────▶│  Repo Visibility│
│  Challenge      │     │  (Client-side)   │     │  Check (GitHub) │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │ Public
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Display        │◀────│  Store Feedback  │◀────│  Store Submit   │
│  Feedback Page  │     │  in Database     │     │  Clear Cache    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        ▲                       ▲                        │
        │                       │                        ▼
        │               ┌──────────────────┐     ┌─────────────────┐
        │               │  Gemini AI       │◀────│  Fetch GitHub   │
        │               │  (Deterministic) │     │  (Parallel +    │
        │               │  temperature=0   │     │   Retry)        │
        │               └──────────────────┘     └─────────────────┘
        │
        │               ┌──────────────────┐
        └───────────────│  Poll Every 3s   │
                        │  for Completion  │
                        └──────────────────┘
```

---

## Key Features

### 1. GitHub Code Analysis with Robust Fetching

**Fetching Features:**

| Feature              | Description                                    |
| -------------------- | ---------------------------------------------- |
| **Timeout**          | 15 seconds per request to prevent hanging      |
| **Retry Logic**      | Up to 3 retries with 1-second delay            |
| **Parallel Fetch**   | 5 files fetched simultaneously for speed       |
| **Rate Limiting**    | Detects GitHub rate limits and reports clearly |
| **Priority Sorting** | Source files fetched before config files       |

### 2. Repository Visibility Check ✅

Before allowing submission, the system verifies your GitHub repository is public.

### 3. Deterministic AI Scoring 🎯

The AI uses deterministic settings to ensure **consistent, reliable scores**:

```typescript
{
  temperature: 0,      // No randomness
  topK: 1,             // Most likely token only
  topP: 1,             // No nucleus sampling
}
```

### 4. Submission Mismatch Detection ⚠️

The AI automatically detects when a user submits the **wrong project** for a challenge.

### 5. Automatic Code Update Detection 🔄

When you update your code on GitHub and resubmit, new feedback is generated automatically.

### 6. Resubmission Comparison

For users who resubmit, the system tracks which issues were fixed vs still need work.

---

## Configuration

### Environment Variables

```env
# Required: Gemini API Key
VITE_GEMINI_API_KEY=your-gemini-api-key

# Required: Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: GitHub Token (for higher rate limits)
VITE_GITHUB_TOKEN=your-github-pat
```

---

## Database Schema

### `challenge_feedback` Table

```sql
CREATE TABLE challenge_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES challenge_submissions(id) UNIQUE NOT NULL,
  overall_score INTEGER NOT NULL,
  overall_rating TEXT NOT NULL,
  -- ... other fields
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint ensures one feedback per submission
ALTER TABLE challenge_feedback
ADD CONSTRAINT unique_feedback_per_submission UNIQUE (submission_id);
```

---

## Troubleshooting

### "Repository must be public"

**Solution:** Change your repository visibility to public in GitHub Settings.

### "Feedback is taking too long"

**Solution:** Wait for timeout, then click "Retry". Check if repo is public.

### "Wrong project detected"

**Solution:** Submit the correct GitHub repository URL for this challenge.

---

## Performance

| Metric                  | Value                   |
| ----------------------- | ----------------------- |
| Average generation time | 20-60 seconds           |
| Temperature             | 0 (fully deterministic) |
| Files analyzed          | Up to 15                |
| GitHub fetch timeout    | 15 seconds per request  |
| GitHub fetch retries    | Up to 3 attempts        |
| Parallel file fetches   | 5 at a time             |

---

## Recent Updates (November 2025)

- **Deterministic AI**: temperature=0, topK=1, topP=1 for consistent scoring
- **Stale Feedback Detection**: Auto-regenerates when code is updated
- **Repository Visibility Check**: Verifies repo is public before submission
- **Improved GitHub Fetching**: Timeout, retry, and parallel fetching
- **Aggressive Cache Management**: Prevents stale feedback display
- **Fixed Regeneration Bug**: Only compares against different previous submissions

---

_Last updated: November 2025_
