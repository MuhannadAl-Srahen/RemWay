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
12. [Future Improvements](#future-improvements)

---

## Overview

The AI Feedback System analyzes user submissions by:

1. **Validating URLs** before processing (client + server side)
2. **Fetching source code** from GitHub repositories with priority-based file selection
3. **Comparing with previous submissions** to track improvement over time
4. **Generating structured feedback** covering code quality, design accuracy, and accessibility
5. **Detecting mismatches** when wrong projects are submitted

### Tech Stack

- **AI Model**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Code Fetching**: GitHub REST API v3 with priority-based file selection
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

| Requirement | Description | Examples |
|-------------|-------------|----------|
| **GitHub Repository** | Your source code must be publicly accessible on GitHub | `https://github.com/username/my-project` |
| **Live Site URL** | Your project must be deployed and accessible online | `https://my-project.vercel.app`, `https://my-project.netlify.app` |

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
   - Repository must be public for code analysis
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
3. AI analysis typically takes **20-40 seconds**
4. The page auto-refreshes when feedback is ready
5. If it takes longer than 2 minutes, you'll see a timeout message with retry option

### Step 5: Review Your Feedback

Your feedback includes:

| Section | Description |
|---------|-------------|
| **Overall Score** | 0-100 score based on all criteria |
| **What You Did Well** | 3-5 positive achievements |
| **Areas for Improvement** | 3-5 actionable suggestions |
| **Design Comparison** | How well your design matches requirements |
| **Technical Analysis** | Detailed breakdown by category |
| **Recommendations** | Next challenges and learning resources |

### Step 6: Resubmit (Optional)

If you want to improve your score:

1. Make changes to your code based on feedback
2. Deploy the updated version
3. Go back to the challenge and submit again
4. The AI will compare your new submission against the previous one
5. You'll see an **"Improvements from Previous"** section showing:
   - Which issues you fixed ✅
   - Which issues still need work ❌
   - Your score improvement

---

## How It Works

### Submission Flow

```
User clicks "Submit"
        │
        ▼
┌─────────────────────────┐
│  Client-side Validation │
│  - GitHub URL format    │
│  - Live Site URL format │
└───────────┬─────────────┘
            │ Valid
            ▼
┌─────────────────────────┐
│  Store in Database      │
│  status = 'pending'     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Navigate to Feedback   │
│  /feedback/:submissionId│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Auto-trigger Generation│
│  (if status = pending)  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  Fetch GitHub Code (Priority-based)     │
│  1. src/*.jsx, src/*.tsx (priority 0)   │
│  2. *.html, *.css (priority 5)          │
│  3. package.json (priority 10)          │
│  4. Config files (priority 15-20)       │
└───────────┬─────────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│  Send to Gemini AI      │
│  - Challenge context    │
│  - Source code          │
│  - Previous feedback    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Parse AI Response      │
│  - JSON validation      │
│  - Truncation repair    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Store Feedback in DB   │
│  status = 'completed'   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Display to User        │
│  (Polling detects it)   │
└─────────────────────────┘
```

### Priority-Based File Fetching

The system intelligently prioritizes which files to fetch from GitHub to ensure relevant source code is analyzed:

| Priority | File Pattern | Examples |
|----------|--------------|----------|
| 0 (Highest) | `src/**/*.jsx`, `src/**/*.tsx` | `src/App.jsx`, `src/components/Card.tsx` |
| 5 | `*.html`, `*.css` | `index.html`, `styles.css` |
| 10 | `package.json`, `*.json` | `package.json`, `tsconfig.json` |
| 15 | Config files | `vite.config.js`, `tailwind.config.js` |
| 20 (Lowest) | Other files | `README.md`, `.gitignore` |

**Limits:**
- Maximum **15 files** analyzed per submission
- Files larger than **50KB** are skipped
- Total code size capped at **100KB**
- Excluded directories: `node_modules/`, `dist/`, `build/`, `.git/`, `vendor/`

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Submits   │────▶│  URL Validation  │────▶│  Store in DB    │
│  Challenge      │     │  (Client-side)   │     │  (Pending)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Display        │◀────│  Store Feedback  │◀────│  Navigate to    │
│  Feedback Page  │     │  in Database     │     │  Feedback Route │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        ▲                       ▲                        │
        │                       │                        ▼
        │               ┌──────────────────┐     ┌─────────────────┐
        │               │  Gemini AI       │◀────│  Fetch GitHub   │
        │               │  Analysis        │     │  Source Code    │
        │               └──────────────────┘     │  (Priority-     │
        │                                        │   based)        │
        │                                        └─────────────────┘
        │               ┌──────────────────┐
        └───────────────│  Poll Every 3s   │
                        │  for Completion  │
                        └──────────────────┘
```

---

## Key Features

### 1. GitHub Code Analysis

The system fetches actual source code from GitHub repositories to provide precise, code-specific feedback.

**Supported file types:**
- HTML, CSS, SCSS, SASS, LESS
- JavaScript, JSX, TypeScript, TSX
- JSON, Markdown

### 2. Submission Mismatch Detection ⚠️

The AI automatically detects when a user submits the **wrong project** for a challenge.

**Example scenario:**
- User is working on "Interactive User Profile Card" challenge
- User accidentally submits a "Beef Recipe Card" project
- AI detects the mismatch and:
  - Sets `submissionMismatch.isMismatched = true`
  - Gives a very low score (0-20)
  - Explains clearly that the wrong project was submitted
  - Shows a prominent warning banner on the feedback page

**Mismatch output:**
```json
{
  "submissionMismatch": {
    "isMismatched": true,
    "expectedProject": "Interactive User Profile Card",
    "actualProject": "Beef Recipe Card",
    "explanation": "The submitted code is a recipe card component, but the challenge requires an interactive user profile card."
  }
}
```

### 3. Live Site Verification

When a live site URL is provided, the AI is instructed to:
- Verify design matches challenge requirements
- Check responsive behavior
- Validate interactive functionality
- Assess overall user experience

### 4. Resubmission Comparison

For users who resubmit a challenge, the system:
- Fetches the previous submission's feedback automatically
- Tracks which issues were fixed vs still need work
- Shows score improvement
- Highlights new skills demonstrated

**Improvements tracking output:**
```json
{
  "improvementsFromPrevious": {
    "issuesFixed": [
      { "issue": "Add alt text to images", "wasFixed": true, "details": "All images now have descriptive alt text" },
      { "issue": "Improve color contrast", "wasFixed": false, "details": "Some text still has low contrast ratio" }
    ],
    "previousScore": 65,
    "scoreImprovement": 20,
    "overallAssessment": "Great progress! Fixed 3 out of 4 issues. Keep working on accessibility."
  }
}
```

### 5. Structured Feedback

The AI generates feedback in a consistent structure:

| Field | Description |
|-------|-------------|
| `overallScore` | 0-100 numerical score |
| `overallRating` | `excellent`, `good`, or `needs_improvement` |
| `whatYouDidWell` | 3-5 positive achievements |
| `areasForImprovement` | 3-5 actionable suggestions |
| `designComparison` | How well the submission matches the design |
| `techAnalysis` | Detailed breakdown by category |
| `recommendations` | Next challenges and learning resources |

---

## Configuration

### Environment Variables

Add these to your `.env.local`:

```env
# Required: Gemini API Key
VITE_GEMINI_API_KEY=your-gemini-api-key

# Required: Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: GitHub Token (for higher rate limits - 5000/hour vs 60/hour)
VITE_GITHUB_TOKEN=your-github-pat
```

### GitHub Token Setup

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Generate a new token (classic) with `repo` scope for private repos, or no scope for public repos
3. Add to `.env.local` as `VITE_GITHUB_TOKEN`

**Rate Limits:**
- Without token: 60 requests/hour
- With token: 5,000 requests/hour

### Gemini API Key Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local` as `VITE_GEMINI_API_KEY`

---

## Database Schema

### `challenge_submissions` Table

```sql
CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  challenge_id UUID REFERENCES challenges(id),
  github_url TEXT NOT NULL,
  live_site_url TEXT,
  screenshots TEXT[],
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `challenge_feedback` Table

```sql
CREATE TABLE challenge_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES challenge_submissions(id),
  overall_score INTEGER,
  overall_rating TEXT,
  overall_good_practices TEXT[],
  improvment_advices TEXT[],
  best_practices JSONB,
  code_formatting JSONB,
  functionality JSONB,
  accessibility JSONB,
  recommended_resources JSONB,
  recommended_next_challenge TEXT,
  overall_analysis_description JSONB,
  comparison_notes JSONB,
  improvements_from_previous JSONB,
  submission_mismatch JSONB,
  ai_model_version TEXT,
  feedback_generation_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

```sql
-- Users can read their own submissions
CREATE POLICY "Users can read own submissions"
ON challenge_submissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow read for feedback generation (server-side)
CREATE POLICY "Allow read submissions for feedback generation"
ON challenge_submissions FOR SELECT
TO anon
USING (true);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions"
ON challenge_submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow feedback insert
CREATE POLICY "Allow feedback insert for all"
ON challenge_feedback FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

---

## Service Structure

```
src/services/
├── ai/
│   ├── api.ts            # AI feedback generation with Gemini
│   ├── githubFetcher.ts  # GitHub code fetching with priority sorting
│   ├── validation.ts     # URL validation utilities
│   └── index.ts          # Public exports
├── feedback/
│   ├── api.ts            # Database operations & feedback orchestration
│   ├── hooks/
│   │   └── useSubmissionFeedback.ts
│   └── components/
│       ├── FeedbackHeader.tsx
│       ├── FeedbackLoading.tsx
│       ├── FeedbackProcessing.tsx
│       ├── FeedbackError.tsx
│       ├── FeedbackStates.tsx
│       ├── OverallAnalysis.tsx
│       ├── DesignComparison.tsx
│       ├── TechAnalysis.tsx
│       ├── Recommendations.tsx
│       ├── MismatchWarning.tsx        # Wrong project warning
│       └── ImprovementsFromPrevious.tsx # Resubmission tracking
└── challenges/
    └── components/
        └── ChallengeSubmission.tsx  # Submission form with validation
```

---

## Error Handling

### Frontend Error States

| State | Trigger | User Experience |
|-------|---------|-----------------|
| **Loading** | Initial page load | Skeleton animation |
| **Processing** | AI generating feedback | "Analyzing your submission..." with progress |
| **Timeout** | > 2 minutes polling | Error message with retry button |
| **Error** | API/network failure | Error message with retry button |
| **Mismatch** | Wrong project submitted | Warning banner + low score explanation |

### Backend Error Handling

1. **Retry Logic**: 2 attempts with exponential backoff (2s, 4s delays)
2. **JSON Repair**: Attempts to fix truncated JSON responses from AI
3. **Fallback Analysis**: If GitHub fetch fails, analyzes based on live site URL only
4. **Validation Errors**: Returns structured error feedback (score = 0)

### URL Validation

**Client-side validation** (in submission form):
- Real-time validation feedback as user types
- Red border and error message for invalid URLs
- Form submission blocked if URLs are invalid

**Server-side validation** (before AI analysis):
- GitHub URL must match pattern: `github.com/owner/repo`
- Live site URL must be a valid HTTP/HTTPS URL
- Localhost URLs are rejected
- Suspicious/placeholder URLs are flagged with warnings

**Handled edge cases:**

| Scenario | Behavior |
|----------|----------|
| Non-GitHub URL submitted | Error feedback stored, score = 0 |
| Fake/placeholder URLs | Warning logged, analysis proceeds with caution |
| Private GitHub repo | Falls back to live site analysis only |
| GitHub rate limit hit | Falls back to live site analysis only |
| Invalid live site URL | Warning added to feedback |

---

## Troubleshooting

### Common Issues

#### "Feedback is taking too long"

**Causes:**
- Large repository with many files
- GitHub rate limiting
- AI service congestion

**Solutions:**
1. Wait for the 2-minute timeout, then click "Retry"
2. Refresh the page and try again
3. Check if your GitHub repo is public
4. Try again during off-peak hours

#### "Wrong project detected"

**Cause:** You submitted code for a different challenge

**Solution:**
1. Go back to the challenge page
2. Submit the correct GitHub repository URL
3. Make sure the repo contains the project for THIS challenge

#### "GitHub code not analyzed"

**Causes:**
- Repository is private
- Rate limit exceeded
- Repository URL is incorrect

**Solutions:**
1. Make your repository public
2. Add a GitHub token to increase rate limits
3. Double-check the repository URL

#### "Score seems too low"

**Check these:**
1. Did you submit the correct project? (check for mismatch warning)
2. Is your live site accessible?
3. Does your code follow the challenge requirements?

### Debug Scripts

**Manual Feedback Script:**
```bash
# Generate feedback for a specific submission
bun scripts/manual-feedback.ts <submission-id>
```

**Debug Script:**
```bash
# Check database state and fetch submission details
bun scripts/debug-feedback.ts <submission-id>
```

### Log Prefixes

Key log prefixes to search for in browser console:
- `[generateAIFeedback]` - AI generation process
- `[fetchRepositoryCode]` - GitHub code fetching
- `[generateAndStoreFeedback]` - Orchestration and storage
- `[getPreviousSubmission]` - Comparison logic
- `[getFilePriority]` - File priority assignment

---

## Performance

### Metrics

| Metric | Value |
|--------|-------|
| Average generation time | 20-40 seconds |
| Max output tokens | 8,192 |
| Temperature | 0.3 (deterministic) |
| Files analyzed | Up to 15 |
| Total code size | Up to 100KB |
| Polling interval | 3 seconds |
| Timeout | 2 minutes |

### Scoring Criteria

The AI uses the following weighted criteria:

| Category | Weight | What's Evaluated |
|----------|--------|------------------|
| **Design** | 30% | Visual accuracy, responsiveness, UI/UX |
| **Code Quality** | 30% | Clean structure, naming, organization |
| **Functionality** | 25% | Features work, error handling |
| **Accessibility** | 15% | Semantic HTML, ARIA, keyboard navigation |

### Rating Thresholds

- **Excellent** (90-100): Production-ready, follows all best practices
- **Good** (75-89): Solid implementation, minor improvements possible
- **Needs Improvement** (60-74): Core functionality works, notable issues
- **Below 60**: Significant problems requiring attention
- **0-20**: Wrong project submitted (mismatch)

---

## Future Improvements

- [ ] Add caching for GitHub code fetches
- [ ] Support more file types (Vue, Svelte, Angular)
- [ ] Add screenshot comparison using vision models
- [ ] Implement feedback regeneration on code updates
- [ ] Add batch feedback generation for multiple submissions
- [ ] Real-time streaming of AI feedback as it's generated
- [ ] Email notifications when feedback is ready
- [ ] Feedback history and progress charts
