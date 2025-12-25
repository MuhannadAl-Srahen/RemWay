# Testing Checklist for Developers

## Before You Commit Code

Use this checklist to ensure your code is properly tested before committing.

---

## ✅ Pre-Commit Checklist

### 1. Unit Tests

- [ ] **New utility functions** have corresponding unit tests
- [ ] **Edge cases** are covered (null, undefined, empty arrays, etc.)
- [ ] **Error cases** are tested (throw errors, invalid inputs)
- [ ] **Pure functions** have 100% test coverage
- [ ] Tests use **descriptive names** (`should validate GitHub URL format`)
- [ ] Tests follow **AAA pattern** (Arrange, Act, Assert)

**Example**:

```typescript
// ✅ Good: Comprehensive unit test
describe('formatDate', () => {
  it('should format valid date correctly', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024')
  })

  it('should handle invalid date gracefully', () => {
    expect(formatDate('invalid')).toBe('Invalid Date')
  })

  it('should handle null input', () => {
    expect(formatDate(null)).toBe('')
  })
})
```

---

### 2. Component Tests

- [ ] **New components** have test files in `__tests__/` folder
- [ ] **All variants/props** are tested
- [ ] **User interactions** are tested (click, type, hover)
- [ ] **Conditional rendering** is tested (loading, error, success states)
- [ ] **Accessibility** is verified (screen reader text, keyboard navigation)
- [ ] Tests use **semantic queries** (getByRole, getByLabelText)

**Example**:

```typescript
// ✅ Good: Comprehensive component test
describe('ChallengeCard', () => {
  it('should display challenge title and difficulty', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText('Recipe Page')).toBeInTheDocument()
    expect(screen.getByText('Beginner')).toBeInTheDocument()
  })

  it('should navigate to detail page on click', async () => {
    const navigate = vi.fn()
    const { user } = render(<ChallengeCard challenge={mockChallenge} />)

    await user.click(screen.getByRole('link'))
    expect(navigate).toHaveBeenCalledWith('/challenges/1')
  })
})
```

---

### 3. Integration Tests

- [ ] **New API endpoints** have integration tests
- [ ] **Multi-step workflows** are tested end-to-end
- [ ] **Error handling** is verified (network errors, validation errors)
- [ ] **External dependencies** are mocked (Supabase, Gemini API)
- [ ] Tests verify **complete user flows** (not just individual functions)

**Example**:

```typescript
// ✅ Good: Integration test for submission flow
describe('Challenge Submission Flow', () => {
  it('should validate, submit, and store solution', async () => {
    // Mock Supabase
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null })
    })

    const result = await submitChallengeSolution('challenge-1', {
      githubUrl: 'https://github.com/user/repo',
      liveUrl: 'https://site.vercel.app'
    })

    expect(result.id).toBe('123')
    expect(supabase.from).toHaveBeenCalledWith('challenge_submissions')
  })
})
```

---

### 4. E2E Tests (when applicable)

- [ ] **New critical user flows** have E2E tests
- [ ] **Authentication flows** are tested
- [ ] **Form submissions** work across browsers
- [ ] **Navigation** works on mobile and desktop
- [ ] **Error states** are handled gracefully

**When to add E2E tests**:

- New authentication flows
- New payment flows
- Critical user journeys (signup, first challenge, feedback)
- Multi-page workflows

---

### 5. Code Quality

- [ ] **All tests pass** locally (`bun test:run`)
- [ ] **No console errors** or warnings in tests
- [ ] **Coverage threshold met** (60%+ for new code)
- [ ] **No `.only` or `.skip`** left in test files
- [ ] **Linter passes** (`bun lint`)
- [ ] **TypeScript compiles** with no errors (`bun run build`)

---

### 6. Test Maintenance

- [ ] **Old tests still pass** after changes
- [ ] **Deprecated tests removed** (if functionality removed)
- [ ] **Flaky tests fixed** (tests that sometimes fail)
- [ ] **Test data updated** to match new schema/types
- [ ] **Mock data realistic** (matches production data structure)

---

## 🚦 When to Write Each Test Type

### Write Unit Tests When:

- Creating **utility functions** (validation, formatting, calculations)
- Writing **pure functions** (same input → same output)
- Implementing **complex logic** (algorithms, parsers)

### Write Component Tests When:

- Creating **new UI components**
- Adding **new variants or props** to existing components
- Fixing **UI bugs** (add regression test first)

### Write Integration Tests When:

- Implementing **new API endpoints**
- Creating **multi-step workflows** (signup → verify → profile)
- Adding **external integrations** (Supabase, Gemini, GitHub)

### Write E2E Tests When:

- Adding **critical user flows** (payment, authentication)
- Implementing **multi-page journeys**
- Testing **browser-specific behavior** (cookies, local storage)

---

## 🎯 Coverage Goals by File Type

| File Type                               | Coverage Target | Priority |
| --------------------------------------- | --------------- | -------- |
| **Utilities** (`lib/*.ts`)              | 90-100%         | High     |
| **API Functions** (`services/*/api.ts`) | 80-90%          | High     |
| **Components** (`components/**/*.tsx`)  | 70-80%          | Medium   |
| **Hooks** (`hooks/**/*.ts`)             | 80-90%          | Medium   |
| **Pages** (`routes/**/*.tsx`)           | 50-60%          | Low\*    |
| **Config Files**                        | 0-20%           | N/A      |

\*Pages tested via E2E tests instead

---

## 🔍 Review Checklist Before Pushing

### 1. Run All Tests

```bash
# Unit + Component tests
bun test:run

# E2E tests (if you added/changed E2E tests)
bun test:e2e
```

**Expected**: ✅ All tests pass

### 2. Check Coverage

```bash
bun test:coverage
```

**Expected**: ✅ Coverage >= 60% (or previous level maintained)

### 3. Lint Code

```bash
bun lint
```

**Expected**: ✅ No linting errors

### 4. Type Check

```bash
bun run build
```

**Expected**: ✅ No TypeScript errors

---

## 📋 Feature Implementation Checklist

Use this when implementing a **new feature**:

### Before Coding

- [ ] **Understand requirements** - What problem does this solve?
- [ ] **Design API** - What functions/components are needed?
- [ ] **Plan test cases** - What scenarios to test?

### During Coding

- [ ] **Write test first** (TDD) or alongside implementation
- [ ] **Test happy path** (expected user behavior)
- [ ] **Test error cases** (invalid inputs, network failures)
- [ ] **Test edge cases** (empty, null, boundary conditions)

### After Coding

- [ ] **Run tests** (`bun test:run`)
- [ ] **Check coverage** (`bun test:coverage`)
- [ ] **Lint code** (`bun lint`)
- [ ] **Manual testing** in browser
- [ ] **Update documentation** if needed

---

## 🐛 Bug Fix Checklist

Use this when **fixing a bug**:

### 1. Write Failing Test

```typescript
// ✅ Good: Regression test
it('should not crash when challenge has no tags', () => {
  const challengeWithoutTags = { ...mockChallenge, tags: undefined }
  render(<ChallengeCard challenge={challengeWithoutTags} />)
  expect(screen.getByText('Recipe Page')).toBeInTheDocument()
})
```

### 2. Fix the Bug

Make minimal changes to fix the issue.

### 3. Verify Test Passes

```bash
bun test:run
```

**Expected**: ✅ Previously failing test now passes

### 4. Check No Regressions

```bash
bun test:run
```

**Expected**: ✅ All other tests still pass

---

## ⚠️ Common Testing Mistakes

### ❌ Testing Implementation Details

```typescript
// ❌ Bad: Tests internal state
it('should set isLoading to true', () => {
  const { result } = renderHook(() => useChallenges())
  expect(result.current.isLoading).toBe(true)
})

// ✅ Good: Tests user-visible behavior
it('should show loading spinner while fetching', () => {
  render(<ChallengesList />)
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
})
```

### ❌ Using Non-Semantic Queries

```typescript
// ❌ Bad: Brittle query
const button = container.querySelector('.submit-button')

// ✅ Good: Semantic query
const button = screen.getByRole('button', { name: /submit/i })
```

### ❌ Not Waiting for Async Updates

```typescript
// ❌ Bad: Doesn't wait for async state update
user.click(screen.getByText('Load More'))
expect(screen.getAllByTestId('challenge-card')).toHaveLength(6)

// ✅ Good: Waits for async update
await user.click(screen.getByText('Load More'))
const challenges = await screen.findAllByTestId('challenge-card')
expect(challenges).toHaveLength(6)
```

### ❌ Shared State Between Tests

```typescript
// ❌ Bad: Tests share state
let user = { id: '123' }

it('test 1', () => {
  user.name = 'Alice'  // Modifies shared state
})

it('test 2', () => {
  expect(user.name).toBe('Alice')  // Depends on test 1
})

// ✅ Good: Isolated state
it('test 1', () => {
  const user = { id: '123', name: 'Alice' }
  // ...
})

it('test 2', () => {
  const user = { id: '123', name: 'Bob' }
  // ...
})
```

---

## 🎓 Learning Resources

### Testing Library Best Practices

- [Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Library Queries Priority](https://testing-library.com/docs/queries/about/#priority)

### Vitest

- [Vitest API Reference](https://vitest.dev/api/)
- [Mocking in Vitest](https://vitest.dev/guide/mocking.html)

### Playwright

- [Writing Your First Test](https://playwright.dev/docs/writing-tests)
- [Locators](https://playwright.dev/docs/locators)

---

## 📝 Summary

**Before every commit**, ensure:

1. ✅ All tests pass (`bun test:run`)
2. ✅ Coverage maintained/increased (`bun test:coverage`)
3. ✅ Linter passes (`bun lint`)
4. ✅ TypeScript compiles (`bun run build`)
5. ✅ No `.only` or `.skip` in tests
6. ✅ Manual testing done in browser

**When adding new features**:

- Write tests for all new functions/components
- Cover happy path, error cases, and edge cases
- Aim for 60%+ coverage on new code

**When fixing bugs**:

- Write failing test that reproduces bug
- Fix bug
- Verify test passes and no regressions

---

**Remember**: Good tests are:

- ✅ **Fast** (run in milliseconds)
- ✅ **Isolated** (no shared state)
- ✅ **Repeatable** (same result every time)
- ✅ **Self-validating** (pass/fail, no manual checks)
- ✅ **Timely** (written with or before code)

---

For detailed testing guides, see:

- [Testing Quick Start](/docs/TESTING_QUICK_START.md)
- [Testing Implementation Summary](/docs/TESTING_IMPLEMENTATION_SUMMARY.md)
