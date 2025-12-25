# Testing Quick Start Guide

## PexFect Testing Suite

This guide helps you get started with running and writing tests for PexFect.

---

## 🚀 Quick Start

### 1. Install Dependencies (if not already installed)

```bash
bun install
```

### 2. Run All Tests

```bash
bun test:run
```

### 3. View Coverage Report

```bash
bun test:coverage
```

Open `coverage/index.html` in your browser to see detailed coverage.

### 4. Run E2E Tests

```bash
# First time: Install Playwright browsers
bunx playwright install

# Run E2E tests
bun test:e2e
```

---

## 📁 Test File Structure

```
Pexfect/
├── src/
│   ├── test/
│   │   ├── setup.ts                 # Global test setup
│   │   ├── utils/
│   │   │   ├── render.tsx           # Custom render with providers
│   │   │   └── test-utils.ts        # Test helper functions
│   │   └── mocks/
│   │       ├── data.ts              # Mock test data
│   │       └── supabase.ts          # Mock Supabase client
│   │
│   ├── lib/__tests__/               # Unit tests for utilities
│   │   ├── utils.test.ts
│   │   └── queryConfig.test.ts
│   │
│   ├── components/ui/__tests__/     # Component tests for UI
│   │   ├── button.test.tsx
│   │   ├── card.test.tsx
│   │   ├── input.test.tsx
│   │   ├── tabs.test.tsx
│   │   ├── badge.test.tsx
│   │   ├── label.test.tsx
│   │   └── checkbox.test.tsx
│   │
│   └── services/
│       ├── ai/__tests__/
│       │   └── validation.test.ts   # AI validation unit tests
│       └── challenges/__tests__/
│           └── api.integration.test.ts  # Integration tests
│
├── tests/
│   ├── e2e/                         # Playwright E2E tests
│   │   ├── basic-navigation.spec.ts
│   │   ├── user-flows.spec.ts
│   │   └── security.spec.ts
│   │
│   └── uat/
│       └── UAT_TEST_PLAN.md         # User acceptance testing plan
│
├── vitest.config.ts                 # Vitest configuration
└── playwright.config.ts             # Playwright configuration
```

---

## 🧪 Test Types

### Unit Tests

**Location**: `src/lib/__tests__/`, `src/services/*/\_\_tests__/`  
**Purpose**: Test individual functions in isolation  
**Run**: `bun test:run --grep "test.ts$"`

Example:

```typescript
import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })
})
```

### Component Tests

**Location**: `src/components/**/__tests__/`  
**Purpose**: Test React components  
**Run**: `bun test:run --grep "test.tsx$"`

Example:

```typescript
import { render, screen } from '@/test/utils/render'
import { Button } from '../button'

describe('Button', () => {
  it('should render', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### Integration Tests

**Location**: `src/services/**/__tests__/*.integration.test.ts`  
**Purpose**: Test multiple components/functions working together  
**Run**: `bun test:run --grep "integration"`

Example:

```typescript
import { submitChallengeSolution } from '../api'

describe('Challenge Submission', () => {
  it('should submit valid solution', async () => {
    const result = await submitChallengeSolution('id', { /* data */ })
    expect(result).toBeDefined()
  })
})
```

### E2E Tests

**Location**: `tests/e2e/`  
**Purpose**: Test complete user flows in a real browser  
**Run**: `bun test:e2e`

Example:

```typescript
import { test, expect } from '@playwright/test'

test('should navigate to challenges', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Challenges')
  await expect(page).toHaveURL(/challenges/)
})
```

---

## 📝 Writing Tests

### Test Naming Convention

```typescript
// ✅ Good: Descriptive, behavior-focused
it('should display error message when URL is invalid', () => {})
it('should disable submit button when form is incomplete', () => {})

// ❌ Bad: Vague, implementation-focused
it('test button', () => {})
it('should call handleClick', () => {})
```

### AAA Pattern (Arrange, Act, Assert)

```typescript
it('should increment counter on click', async () => {
  // Arrange: Set up test data and render component
  const { user } = render(<Counter initialCount={0} />)

  // Act: Perform user action
  await user.click(screen.getByRole('button', { name: /increment/i }))

  // Assert: Verify expected outcome
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### Using Custom Render

```typescript
import { render, screen } from '@/test/utils/render'

it('should render with providers', () => {
  // Automatically wraps with QueryClient and ThemeProvider
  const { user } = render(<MyComponent />)

  // user is already set up with userEvent.setup()
  await user.click(screen.getByRole('button'))
})
```

### Mocking Supabase

```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-id' } },
          error: null,
        })
      ),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}))
```

---

## 🎯 Testing Guidelines

### DO ✅

- **Test user behavior**, not implementation details
- **Use semantic queries** (getByRole, getByLabelText, getByText)
- **Test accessibility** (screen readers, keyboard navigation)
- **Mock external APIs** (Supabase, Gemini)
- **Write descriptive test names**
- **Keep tests isolated** (no shared state between tests)
- **Test edge cases** (empty inputs, errors, loading states)

### DON'T ❌

- **Don't test internal state** (use public API instead)
- **Don't use brittle selectors** (avoid getByClassName, getByTestId unless necessary)
- **Don't write implementation-dependent tests**
- **Don't skip cleanup** (use afterEach for cleanup)
- **Don't test third-party libraries** (assume they work)
- **Don't make network requests** (mock them)

---

## 🔧 Common Testing Patterns

### Testing Form Submission

```typescript
it('should submit form with valid data', async () => {
  const onSubmit = vi.fn()
  const { user } = render(<Form onSubmit={onSubmit} />)

  // Fill in form
  await user.type(screen.getByLabelText(/github url/i), 'https://github.com/user/repo')
  await user.type(screen.getByLabelText(/live url/i), 'https://site.vercel.app')

  // Submit
  await user.click(screen.getByRole('button', { name: /submit/i }))

  // Verify callback was called with correct data
  expect(onSubmit).toHaveBeenCalledWith({
    githubUrl: 'https://github.com/user/repo',
    liveUrl: 'https://site.vercel.app',
  })
})
```

### Testing Async Data Loading

```typescript
it('should display challenges after loading', async () => {
  render(<ChallengesList />)

  // Should show loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument()

  // Wait for data to load
  const challenges = await screen.findAllByTestId('challenge-card')

  // Should display challenges
  expect(challenges).toHaveLength(3)
})
```

### Testing Error States

```typescript
it('should display error message on failed submission', async () => {
  // Mock API to return error
  vi.mocked(submitSolution).mockRejectedValueOnce(new Error('Network error'))

  const { user } = render(<SubmissionForm />)

  await user.click(screen.getByRole('button', { name: /submit/i }))

  // Should show error message
  expect(await screen.findByText(/network error/i)).toBeInTheDocument()
})
```

### Testing Conditional Rendering

```typescript
it('should show authenticated content when logged in', () => {
  const { rerender } = render(<Navbar isAuthenticated={false} />)

  // Should show sign in button
  expect(screen.getByText(/sign in/i)).toBeInTheDocument()

  // Change authentication state
  rerender(<Navbar isAuthenticated={true} />)

  // Should show profile link
  expect(screen.getByText(/profile/i)).toBeInTheDocument()
})
```

---

## 🐛 Debugging Tests

### Run Tests in Watch Mode

```bash
bun test:watch
```

Changes in source files will automatically re-run related tests.

### Run Tests with UI

```bash
bun test:ui
```

Opens Vitest UI in browser at `http://localhost:51204` for interactive debugging.

### Debug Single Test

```typescript
it.only('should test specific behavior', () => {
  // Only this test will run
})
```

### Skip Flaky Tests (temporarily)

```typescript
it.skip('flaky test to fix later', () => {
  // This test will be skipped
})
```

### View Playwright Traces

```bash
bun test:e2e:ui
```

Opens Playwright UI to see screenshots, traces, and network activity for each step.

---

## 📊 Coverage Reports

### Generate Coverage

```bash
bun test:coverage
```

### View Coverage Report

```bash
open coverage/index.html
```

### Coverage Thresholds

Current thresholds (60% minimum):

- **Statements**: 60%
- **Branches**: 60%
- **Functions**: 60%
- **Lines**: 60%

Tests will fail if coverage drops below these thresholds.

---

## 🔒 Security Testing

### Run Security E2E Tests

```bash
bun test:e2e tests/e2e/security.spec.ts
```

Covers:

- **Unauthorized access prevention**
- **XSS prevention**
- **URL validation** (prevents javascript:, file:// protocols)
- **Session management** (expired tokens, logout)

### Run Security Linting

```bash
bun lint
```

Uses:

- `eslint-plugin-security` - Detects common security issues
- `eslint-plugin-no-secrets` - Prevents secret leaks

---

## 📚 Additional Resources

### Documentation

- [Testing Implementation Summary](/docs/TESTING_IMPLEMENTATION_SUMMARY.md)
- [UAT Test Plan](/tests/uat/UAT_TEST_PLAN.md)
- [Testing Validation](/docs/05_TESTING_VALIDATION.md)

### External Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## ❓ Troubleshooting

### Tests are failing with "Cannot find module"

**Solution**: Ensure all dependencies are installed:

```bash
bun install
```

### Playwright tests fail with "Browser not found"

**Solution**: Install Playwright browsers:

```bash
bunx playwright install
```

### Tests time out

**Solution**: Increase timeout in test:

```typescript
it('slow test', async () => {
  // Increase timeout to 10 seconds
}, { timeout: 10000 })
```

### Mock not working

**Solution**: Ensure mock is defined before import:

```typescript
// ✅ Mock first
vi.mock('@/lib/supabaseClient', () => ({
  supabase: { /* mock */ }
}))

// Then import
import { MyComponent } from './MyComponent'
```

---

## 🎉 Happy Testing!

For questions or issues, refer to the [Testing Implementation Summary](/docs/TESTING_IMPLEMENTATION_SUMMARY.md) or open an issue in the repository.
