# AI Feedback System

PexFect uses AI-powered feedback to provide detailed, actionable code reviews for frontend challenge submissions.

## Overview

The AI Feedback System analyzes user submissions by:
1. **Fetching source code** from GitHub repositories
2. **Analyzing live site URLs** for design and functionality validation
3. **Comparing with previous submissions** to track improvement over time
4. **Generating structured feedback** covering code quality, design accuracy, and accessibility

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Submits   │────▶│  Trigger Feedback │────▶│  Fetch GitHub   │
│  Challenge      │     │  Generation       │     │  Source Code    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                        ┌──────────────────┐              ▼
                        │  Store Feedback  │◀────┌─────────────────┐
                        │  in Database     │     │  Gemini AI      │
                        └──────────────────┘     │  Analysis       │
                                │                └─────────────────┘
                                ▼
                        ┌──────────────────┐
                        │  Display on      │
                        │  Feedback Page   │
                        └──────────────────┘
```

## Tech Stack

- **AI Model**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Code Fetching**: GitHub REST API v3
- **Database**: Supabase PostgreSQL
- **Frontend**: React + TanStack Query

## Key Features

### 1. GitHub Code Analysis
The system fetches actual source code from GitHub repositories to provide precise, code-specific feedback.

**Supported file types:**
- HTML, CSS, SCSS, SASS, LESS
- JavaScript, JSX, TypeScript, TSX
- JSON, Markdown

**Limitations:**
- Max 5 files per submission (for performance)
- Files > 50KB are skipped
- Total code limit: 100KB
- Excludes: `node_modules/`, `dist/`, `build/`, `.git/`, `vendor/`

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

### 4. Submission Comparison
For users who resubmit a challenge, the system:
- Fetches the previous submission automatically
- Compares code quality improvements
- Identifies regressions (if any)
- Highlights new skills demonstrated

**Comparison output includes:**
```json
{
  "comparisonNotes": {
    "improvements": ["Better responsive design", "Cleaner code structure"],
    "regressions": [],
    "newSkills": ["CSS Grid implementation", "Semantic HTML usage"]
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

## Configuration

### Environment Variables

Add these to your `.env.local`:

```env
# Required: Gemini API Key
VITE_GEMINI_API_KEY=your-gemini-api-key

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

## Database Schema

### `challenge_feedback` Table

```sql
CREATE TABLE challenge_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES challenge_submissions(id),
  overall_score INTEGER,
  overall_rating TEXT,
  overall_good_practices TEXT[],
  improvment_advices TEXT[],
  best_practices TEXT[],
  code_formatting TEXT[],
  functionality TEXT[],
  accessibility TEXT[],
  recommended_resources JSONB,
  recommended_next_challenge TEXT,
  overall_analysis_description JSONB,
  comparison_notes JSONB,
  ai_model_version TEXT,
  feedback_generation_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

```sql
-- Allow anyone to read feedback for feedback generation
CREATE POLICY "Allow read submissions for feedback generation"
ON challenge_submissions FOR SELECT
TO anon, authenticated
USING (true);

-- Allow feedback insert
CREATE POLICY "Allow feedback insert for all"
ON challenge_feedback FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

## Service Structure

```
src/services/
├── ai/
│   ├── api.ts            # AI feedback generation with Gemini
│   └── githubFetcher.ts  # GitHub code fetching utilities
├── feedback/
│   ├── api.ts            # Database operations & feedback orchestration
│   ├── hooks/            # React Query hooks
│   │   └── useFeedback.ts
│   └── components/       # UI components
│       ├── FeedbackHeader.tsx
│       ├── FeedbackLoading.tsx
│       ├── FeedbackProcessing.tsx
│       ├── FeedbackError.tsx
│       ├── FeedbackStates.tsx
│       ├── OverallAnalysis.tsx
│       ├── DesignComparison.tsx
│       ├── TechAnalysis.tsx
│       └── Recommendations.tsx
```

## Usage

### Automatic Trigger

Feedback generation is automatically triggered when a user visits the feedback page:

```tsx
// src/routes/feedback/$submissionId.tsx
useEffect(() => {
  if (data?.status === 'pending' && !hasTriggered) {
    triggerFeedbackGeneration(submissionId);
    // Polls every 3 seconds for updates
  }
}, [data, submissionId]);
```

### Manual Generation

Users can also manually trigger generation:

```tsx
<Button onClick={() => triggerFeedbackGeneration(submissionId)}>
  Generate Feedback Now
</Button>
```

### API Functions

```typescript
// Generate and store feedback
import { generateAndStoreFeedback } from '@/services/feedback';
await generateAndStoreFeedback(submissionId);

// Trigger generation (non-blocking)
import { triggerFeedbackGeneration } from '@/services/feedback';
await triggerFeedbackGeneration(submissionId);

// Fetch existing feedback
import { getSubmissionFeedback } from '@/services/feedback';
const { submission, feedback, challenge, status } = await getSubmissionFeedback(submissionId);
```

## Scoring Criteria

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

## Error Handling

The system includes robust error handling:

1. **Retry Logic**: 2 attempts with exponential backoff (2s, 4s delays)
2. **JSON Repair**: Attempts to fix truncated JSON responses
3. **Fallback Analysis**: If GitHub fetch fails, analyzes based on live site URL
4. **Timeout Protection**: 2-minute maximum polling time on frontend

### URL Validation

The system validates all submission URLs before processing:

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
| Private GitHub repo | Falls back to live site analysis |
| GitHub rate limit hit | Falls back to live site analysis |
| Invalid live site URL | Warning added to feedback |

### Validation Error Response

When invalid URLs are submitted, the system generates error feedback:

```json
{
  "overallScore": 0,
  "overallRating": "needs_improvement",
  "whatYouDidWell": [],
  "areasForImprovement": [
    "Please submit a valid GitHub repository URL",
    "Invalid GitHub URL: must be github.com/username/repo"
  ],
  "submissionMismatch": {
    "isMismatched": true,
    "expectedProject": "Valid GitHub Repository URL",
    "actualProject": "https://fake-url.com",
    "explanation": "The submitted URL is not a valid GitHub repository"
  }
}
```

## Performance

| Metric | Value |
|--------|-------|
| Average generation time | 20-30 seconds |
| Max output tokens | 8,192 |
| Temperature | 0.3 (deterministic) |
| Files analyzed | Up to 5 |
| Total code size | Up to 100KB |

## Debugging

### Manual Feedback Script

For debugging, use the manual feedback script:

```bash
# Generate feedback for a specific submission
bun scripts/manual-feedback.ts <submission-id>
```

### Debug Script

Check database state and fetch submission details:

```bash
bun scripts/debug-feedback.ts <submission-id>
```

### Logs

Key log prefixes to search for:
- `[generateAIFeedback]` - AI generation process
- `[fetchRepositoryCode]` - GitHub code fetching
- `[generateAndStoreFeedback]` - Orchestration and storage
- `[getPreviousSubmission]` - Comparison logic

## Future Improvements

- [ ] Add caching for GitHub code fetches
- [ ] Support more file types (Vue, Svelte)
- [ ] Add screenshot comparison using vision models
- [ ] Implement feedback regeneration on code updates
- [ ] Add batch feedback generation for multiple submissions
