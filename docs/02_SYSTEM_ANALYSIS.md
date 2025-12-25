# PexFect - System Analysis & Requirements

## Document Information

| Field             | Value                          |
| ----------------- | ------------------------------ |
| **Project Name**  | PexFect                        |
| **Version**       | 1.0.0                          |
| **Document Type** | System Analysis & Requirements |
| **Last Updated**  | January 2026                   |

---

## 1. System Overview

PexFect is a web-based frontend coding challenge platform that combines traditional learning with AI-powered feedback. The system operates as a client-side application with a Backend-as-a-Service (BaaS) architecture using Supabase.

### 1.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SYSTEMS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐    │
│   │   GitHub    │    │   Gemini    │    │      Vercel         │    │
│   │   OAuth     │    │   AI API    │    │   (Live Sites)      │    │
│   └──────┬──────┘    └──────┬──────┘    └──────────┬──────────┘    │
│          │                  │                       │               │
└──────────┼──────────────────┼───────────────────────┼───────────────┘
           │                  │                       │
           ▼                  ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PEXFECT APPLICATION                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    React Frontend (SPA)                      │   │
│   │  ┌────────────┬────────────┬────────────┬────────────────┐  │   │
│   │  │ Challenges │ Feedback   │ Roadmap    │ Profile        │  │   │
│   │  │ Service    │ Service    │ Service    │ Service        │  │   │
│   │  └────────────┴────────────┴────────────┴────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                  │                                   │
│                                  ▼                                   │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    Supabase Backend                          │   │
│   │  ┌────────────┬────────────┬────────────────────────────┐   │   │
│   │  │ PostgreSQL │ Auth       │ Row Level Security (RLS)   │   │   │
│   │  │ Database   │ Service    │                            │   │   │
│   │  └────────────┴────────────┴────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Functional Requirements

### 2.1 User Management (FR-UM)

| ID       | Requirement                                            | Priority | Status  |
| -------- | ------------------------------------------------------ | -------- | ------- |
| FR-UM-01 | Users shall authenticate via GitHub OAuth              | High     | ✅ Done |
| FR-UM-02 | Users shall have a profile with avatar, bio, and links | Medium   | ✅ Done |
| FR-UM-03 | Users shall be able to edit their profile settings     | Medium   | ✅ Done |
| FR-UM-04 | System shall display user's GitHub username            | High     | ✅ Done |
| FR-UM-05 | Users shall be able to sign out                        | High     | ✅ Done |

### 2.2 Challenge Management (FR-CM)

| ID       | Requirement                                     | Priority | Status  |
| -------- | ----------------------------------------------- | -------- | ------- |
| FR-CM-01 | System shall display list of all challenges     | High     | ✅ Done |
| FR-CM-02 | Users shall filter challenges by difficulty     | Medium   | ✅ Done |
| FR-CM-03 | Users shall filter challenges by category       | Medium   | ✅ Done |
| FR-CM-04 | Users shall search challenges by title          | Medium   | ✅ Done |
| FR-CM-05 | Users shall view challenge details              | High     | ✅ Done |
| FR-CM-06 | Users shall access Figma designs for challenges | High     | ✅ Done |
| FR-CM-07 | Users shall save/bookmark challenges            | Low      | ✅ Done |
| FR-CM-08 | Users shall toggle between grid and list views  | Low      | ✅ Done |

### 2.3 Submission System (FR-SS)

| ID       | Requirement                                                  | Priority | Status  |
| -------- | ------------------------------------------------------------ | -------- | ------- |
| FR-SS-01 | Users shall submit GitHub URL and live site URL              | High     | ✅ Done |
| FR-SS-02 | System shall validate GitHub URL format                      | High     | ✅ Done |
| FR-SS-03 | System shall verify repository is public                     | High     | ✅ Done |
| FR-SS-04 | System shall verify GitHub ownership                         | High     | ✅ Done |
| FR-SS-05 | System shall prevent duplicate submissions across challenges | Medium   | ✅ Done |
| FR-SS-06 | Users shall upload optional screenshot                       | Low      | ✅ Done |
| FR-SS-07 | System shall track submission history                        | Medium   | ✅ Done |
| FR-SS-08 | System shall support resubmissions                           | High     | ✅ Done |

### 2.4 AI Feedback System (FR-AI)

| ID       | Requirement                                               | Priority | Status  |
| -------- | --------------------------------------------------------- | -------- | ------- |
| FR-AI-01 | System shall fetch source code from GitHub                | High     | ✅ Done |
| FR-AI-02 | System shall generate AI feedback using Gemini            | High     | ✅ Done |
| FR-AI-03 | Feedback shall include overall score (0-100)              | High     | ✅ Done |
| FR-AI-04 | Feedback shall include score breakdown by category        | High     | ✅ Done |
| FR-AI-05 | Feedback shall list positive achievements                 | Medium   | ✅ Done |
| FR-AI-06 | Feedback shall list improvement suggestions               | Medium   | ✅ Done |
| FR-AI-07 | System shall compare resubmissions with previous feedback | High     | ✅ Done |
| FR-AI-08 | System shall detect mismatched project submissions        | Medium   | ✅ Done |
| FR-AI-09 | Feedback shall be deterministic (consistent scoring)      | High     | ✅ Done |

### 2.5 Learning Paths (FR-LP)

| ID       | Requirement                                   | Priority | Status     |
| -------- | --------------------------------------------- | -------- | ---------- |
| FR-LP-01 | System shall display available learning paths | High     | ✅ Done    |
| FR-LP-02 | Paths shall include estimated duration        | Medium   | ✅ Done    |
| FR-LP-03 | Users shall start a learning path             | Medium   | ✅ Done    |
| FR-LP-04 | System shall track path progress              | Medium   | ✅ Done    |
| FR-LP-05 | Challenges shall unlock progressively         | Low      | 🔄 Partial |

### 2.6 Progress Tracking (FR-PT)

| ID       | Requirement                                 | Priority | Status  |
| -------- | ------------------------------------------- | -------- | ------- |
| FR-PT-01 | Users shall view their completed challenges | Medium   | ✅ Done |
| FR-PT-02 | Users shall view their submission history   | Medium   | ✅ Done |
| FR-PT-03 | System shall display progress statistics    | Medium   | ✅ Done |
| FR-PT-04 | Users shall view their saved challenges     | Low      | ✅ Done |

---

## 3. Non-Functional Requirements

### 3.1 Performance (NFR-P)

| ID       | Requirement            | Target            | Measurement         |
| -------- | ---------------------- | ----------------- | ------------------- |
| NFR-P-01 | Initial page load time | < 3 seconds       | Lighthouse LCP      |
| NFR-P-02 | Route navigation time  | < 500ms           | Time to Interactive |
| NFR-P-03 | AI feedback generation | < 60 seconds      | API response time   |
| NFR-P-04 | Database query time    | < 200ms           | Supabase metrics    |
| NFR-P-05 | Client bundle size     | < 600KB (initial) | Webpack analyzer    |

### 3.2 Security (NFR-S)

| ID       | Requirement                              | Implementation            |
| -------- | ---------------------------------------- | ------------------------- |
| NFR-S-01 | Authentication via OAuth only            | GitHub OAuth via Supabase |
| NFR-S-02 | Row Level Security on all tables         | Supabase RLS policies     |
| NFR-S-03 | API keys stored in environment variables | Vite env variables        |
| NFR-S-04 | HTTPS required in production             | Vercel SSL                |
| NFR-S-05 | Repository ownership verification        | GitHub username matching  |

### 3.3 Usability (NFR-U)

| ID       | Requirement            | Target                           |
| -------- | ---------------------- | -------------------------------- |
| NFR-U-01 | Responsive design      | Works on mobile, tablet, desktop |
| NFR-U-02 | Dark mode support      | System preference detection      |
| NFR-U-03 | Keyboard accessibility | Full keyboard navigation         |
| NFR-U-04 | Screen reader support  | Semantic HTML, ARIA labels       |
| NFR-U-05 | Clear error messages   | Actionable error states          |

### 3.4 Reliability (NFR-R)

| ID       | Requirement      | Target                           |
| -------- | ---------------- | -------------------------------- |
| NFR-R-01 | Uptime           | 99.9% availability               |
| NFR-R-02 | Error handling   | Graceful degradation             |
| NFR-R-03 | Data persistence | No data loss on errors           |
| NFR-R-04 | Retry logic      | Auto-retry on transient failures |

### 3.5 Scalability (NFR-SC)

| ID        | Requirement        | Capacity                  |
| --------- | ------------------ | ------------------------- |
| NFR-SC-01 | Concurrent users   | 1000+ simultaneous        |
| NFR-SC-02 | Database growth    | Auto-scaling via Supabase |
| NFR-SC-03 | AI API rate limits | Queuing for high traffic  |

---

## 4. Use Case Diagrams

### 4.1 Primary Use Cases

```
                    ┌─────────────────────────────────────────┐
                    │              PexFect System             │
                    │                                         │
    ┌───────┐       │   ┌─────────────────────────────────┐   │
    │       │       │   │         Browse Challenges       │   │
    │       │───────┼──▶│  - Filter by difficulty         │   │
    │       │       │   │  - Filter by category           │   │
    │       │       │   │  - Search by title              │   │
    │       │       │   └─────────────────────────────────┘   │
    │       │       │                                         │
    │       │       │   ┌─────────────────────────────────┐   │
    │       │       │   │        View Challenge           │   │
    │ User  │───────┼──▶│  - See requirements             │   │
    │       │       │   │  - Access Figma design          │   │
    │       │       │   │  - Download starter files       │   │
    │       │       │   └─────────────────────────────────┘   │
    │       │       │                                         │
    │       │       │   ┌─────────────────────────────────┐   │
    │       │       │   │       Submit Solution           │   │
    │       │───────┼──▶│  - Enter GitHub URL             │   │
    │       │       │   │  - Enter live site URL          │   │
    │       │       │   │  - Upload screenshot            │   │
    │       │       │   └─────────────────────────────────┘   │
    │       │       │                                         │
    │       │       │   ┌─────────────────────────────────┐   │
    │       │       │   │        View Feedback            │   │
    │       │───────┼──▶│  - See overall score            │   │
    │       │       │   │  - Read detailed analysis       │   │
    │       │       │   │  - Get recommendations          │   │
    └───────┘       │   └─────────────────────────────────┘   │
                    │                                         │
                    └─────────────────────────────────────────┘
```

### 4.2 Authentication Use Cases

```
    ┌───────────┐           ┌─────────────────┐           ┌─────────────┐
    │   User    │           │    PexFect      │           │   GitHub    │
    └─────┬─────┘           └────────┬────────┘           └──────┬──────┘
          │                          │                           │
          │  1. Click "Sign In"      │                           │
          │─────────────────────────▶│                           │
          │                          │                           │
          │                          │  2. Redirect to OAuth     │
          │                          │──────────────────────────▶│
          │                          │                           │
          │                          │  3. User authorizes       │
          │◀─────────────────────────│◀──────────────────────────│
          │                          │                           │
          │  4. Session established  │                           │
          │◀─────────────────────────│                           │
          │                          │                           │
```

---

## 5. Data Requirements

### 5.1 Entity-Relationship Diagram

```
┌─────────────────────┐         ┌─────────────────────┐
│      profiles       │         │      challenges     │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │         │ id (PK)             │
│ user_id (FK)        │         │ title               │
│ username            │         │ description         │
│ full_name           │         │ difficulty          │
│ avatar_url          │         │ category            │
│ bio                 │         │ figma_url           │
│ location            │◀───┐    │ estimated_time      │
│ website             │    │    │ created_at          │
│ github_username     │    │    └──────────┬──────────┘
│ created_at          │    │               │
└──────────┬──────────┘    │               │
           │               │               │
           │               │               │
           ▼               │               ▼
┌─────────────────────┐    │    ┌─────────────────────┐
│  saved_challenges   │    │    │ challenge_overview  │
├─────────────────────┤    │    ├─────────────────────┤
│ id (PK)             │    │    │ challenge_id (FK)   │
│ profile_id (FK)     │────┘    │ livepreviewurl      │
│ challenge_id (FK)   │         │ design_assets       │
│ created_at          │         │ starter_files       │
└─────────────────────┘         └─────────────────────┘
           │
           │
           ▼
┌─────────────────────┐         ┌─────────────────────┐
│challenge_submissions│────────▶│ challenge_feedback  │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │         │ id (PK)             │
│ profile_id (FK)     │         │ submission_id (FK)  │
│ challenge_id (FK)   │         │ overall_score       │
│ github_url          │         │ overall_rating      │
│ live_site_url       │         │ best_practices[]    │
│ screenshots[]       │         │ code_formatting[]   │
│ submitted_at        │         │ functionality[]     │
│ previous_submission │         │ accessibility[]     │
└─────────────────────┘         │ created_at          │
                                └─────────────────────┘
```

### 5.2 Data Dictionary

| Table                   | Column            | Type    | Description                      |
| ----------------------- | ----------------- | ------- | -------------------------------- |
| `profiles`              | `id`              | UUID    | Primary key                      |
| `profiles`              | `user_id`         | UUID    | Supabase auth user reference     |
| `profiles`              | `username`        | TEXT    | Unique username                  |
| `profiles`              | `github_username` | TEXT    | GitHub account name              |
| `challenge_submissions` | `github_url`      | TEXT    | Repository URL                   |
| `challenge_submissions` | `live_site_url`   | TEXT    | Deployed site URL                |
| `challenge_feedback`    | `overall_score`   | INTEGER | Score 0-100                      |
| `challenge_feedback`    | `overall_rating`  | TEXT    | excellent/good/needs_improvement |

---

## 6. Interface Requirements

### 6.1 External Interfaces

| Interface    | Type           | Purpose               | Authentication |
| ------------ | -------------- | --------------------- | -------------- |
| Supabase     | REST/WebSocket | Database & Auth       | Anonymous/JWT  |
| GitHub OAuth | OAuth 2.0      | User authentication   | OAuth tokens   |
| GitHub API   | REST           | Repository validation | Public API     |
| Gemini AI    | REST           | Code analysis         | API key        |

### 6.2 User Interface Requirements

| Screen           | Components                       | Authentication       |
| ---------------- | -------------------------------- | -------------------- |
| Home             | Hero, Features, CTA              | Public               |
| Challenges       | Grid/List, Filters, Pagination   | Public               |
| Challenge Detail | Tabs, Submit Form                | Submit requires auth |
| Feedback         | Score, Analysis, Recommendations | Required             |
| Profile          | Stats, Activity, Settings        | Required             |
| Roadmap          | Paths, Progress                  | Public               |

---

## 7. Constraints & Assumptions

### 7.1 Constraints

| Category       | Constraint                       |
| -------------- | -------------------------------- |
| **Technology** | Must use React 19 and TypeScript |
| **Backend**    | Supabase only (no custom server) |
| **AI**         | Gemini API rate limits apply     |
| **Storage**    | Supabase storage limits          |
| **Budget**     | Free tier services initially     |

### 7.2 Assumptions

| Assumption                       | Rationale                   |
| -------------------------------- | --------------------------- |
| Users have GitHub accounts       | Required for authentication |
| Users can deploy to free hosting | Vercel/Netlify free tiers   |
| Public repositories only         | AI needs code access        |
| Modern browser support           | ES2020+ features used       |

---

## 8. Acceptance Criteria

### 8.1 Feature Acceptance

| Feature            | Criteria                                   |
| ------------------ | ------------------------------------------ |
| Authentication     | User can sign in/out with GitHub           |
| Challenge Browsing | Can filter, search, and view challenges    |
| Submission         | Can submit valid URLs and receive feedback |
| Feedback           | Displays structured, actionable feedback   |
| Progress           | Can track completed challenges             |

### 8.2 Quality Acceptance

| Quality Attribute | Criteria                      |
| ----------------- | ----------------------------- |
| Performance       | LCP < 3s, TTI < 5s            |
| Accessibility     | WCAG 2.1 AA compliance        |
| Responsiveness    | Works on 320px to 2560px      |
| Browser Support   | Chrome, Firefox, Safari, Edge |

---

_Document End_
