# Contributing to RemWay

Thank you for your interest in contributing to RemWay! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting, or derogatory remarks
- Personal or political attacks
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Git
- A Supabase account (for backend features)
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Setting Up Your Development Environment

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/RemWay.git
   cd RemWay
   ```

2. **Install Dependencies**

   ```bash
   bun install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start Development Server**

   ```bash
   bun dev
   ```

5. **Verify Setup**
   - Open http://localhost:5000 (the port set in `vite.config.ts`)
   - Ensure the application loads without errors
   - Check that hot reload works

6. **Configure `git blame` (recommended)**

   The repo contains a bulk formatting commit that would otherwise dominate
   `git blame` output. Tell Git to skip it:

   ```bash
   git config blame.ignoreRevsFile .git-blame-ignore-revs
   ```

   Only mechanical commits (formatting, mass renames) belong in that file —
   never anything that changes behaviour.

## Development Workflow

### Branch Naming Convention

Use descriptive branch names following this pattern:

```
feature/pf-[issue-number]-brief-description
fix/pf-[issue-number]-brief-description
refactor/pf-[issue-number]-brief-description
docs/pf-[issue-number]-brief-description
```

Examples:

- `feature/pf-42-add-dark-mode`
- `fix/pf-38-navbar-mobile-layout`
- `refactor/pf-51-simplify-auth-flow`

### Creating a New Feature

1. **Create an Issue**
   - Describe the feature or bug clearly
   - Include acceptance criteria
   - Add relevant labels (feature, bug, enhancement)

2. **Create a Branch**

   ```bash
   git checkout -b feature/pf-[issue-number]-description
   ```

3. **Make Changes**
   - Follow the coding standards
   - Write clean, documented code
   - Include tests if applicable

4. **Test Your Changes**

   ```bash
   bun run lint
   bun run build
   bun run format
   ```

5. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/pf-[issue-number]-description
   ```

## Coding Standards

### TypeScript Guidelines

#### Type Safety

- ✅ Use explicit types for function parameters and return values
- ✅ Avoid `any` - use `unknown` if type is truly dynamic
- ✅ Use type guards for runtime type checking
- ❌ Don't disable TypeScript checks without good reason

```typescript
// Good
interface User {
  id: string
  name: string
  email: string
}

function getUser(id: string): Promise<User | null> {
  // implementation
}

// Bad
function getUser(id: any): any {
  // implementation
}
```

#### Interfaces vs Types

- Use `interface` for object shapes that might be extended
- Use `type` for unions, intersections, or mapped types

```typescript
// Good
interface BaseUser {
  id: string
  name: string
}

interface AdminUser extends BaseUser {
  permissions: string[]
}

type UserRole = 'admin' | 'user' | 'guest'
type UserId = string | number
```

### React Best Practices

#### Component Structure

```typescript
// Imports
import { useState, useEffect } from 'react';
import { ComponentProps } from '@/types';

// Types/Interfaces
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

// Component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // Hooks
  const [state, setState] = useState<string>('');

  // Effects
  useEffect(() => {
    // effect logic
  }, []);

  // Event handlers
  const handleClick = () => {
    onAction?.();
  };

  // Render
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}
```

#### Hooks Guidelines

- ✅ Always use hooks at the top level
- ✅ Extract complex logic into custom hooks
- ✅ Name custom hooks with `use` prefix
- ✅ Document hook dependencies clearly

```typescript
// Good - Custom hook
function useChallenge(id: string) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChallenge(id)
      .then(setChallenge)
      .finally(() => setLoading(false))
  }, [id])

  return { challenge, loading }
}
```

### Styling Guidelines

#### Tailwind CSS

- Use utility classes for styling
- Extract repeated patterns into components
- Follow mobile-first responsive design
- Use custom CSS only when necessary

```tsx
// Good
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors">
  Click me
</button>

// Avoid inline styles
<button style={{ padding: '8px 16px', backgroundColor: 'blue' }}>
  Click me
</button>
```

### File Organization

#### Service Structure

```
services/[feature]/
├── api.ts              # API calls and data fetching
├── index.ts            # Public exports
├── components/         # Feature-specific components
│   ├── FeatureCard.tsx
│   └── FeatureList.tsx
├── hooks/             # Custom hooks
│   ├── useFeature.ts
│   └── useFeatureList.ts
├── lib/               # Helper functions
│   └── featureHelpers.ts
└── utils/             # Utility functions
    └── formatting.ts
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(challenges): add difficulty filter
fix(auth): resolve login redirect issue
refactor(profile): simplify user data fetching
docs(readme): update installation instructions
style(components): format button component
test(utils): add tests for date formatting
chore(deps): update dependencies
```

### Commit Best Practices

- Keep commits atomic and focused
- Write clear, descriptive messages
- Reference issue numbers when applicable
- Don't commit commented-out code
- Don't commit console.log statements

## Pull Request Process

### Before Submitting

1. **Ensure Code Quality**

   ```bash
   bun run lint      # No errors
   bun run build     # Successful build
   bun run format    # Code formatted
   ```

2. **Update Documentation**
   - Update README if adding features
   - Add JSDoc comments for complex functions
   - Update type definitions

3. **Test Thoroughly**
   - Test in different browsers
   - Check responsive design
   - Verify accessibility

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue

Closes #[issue-number]

## Testing

- [ ] Tested locally
- [ ] Tested in production-like environment
- [ ] Added/updated tests

## Screenshots (if applicable)

[Add screenshots]

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Dependent changes merged
```

### Review Process

1. Automated checks must pass (lint, build)
2. At least one approval required
3. All comments must be resolved
4. Branch must be up to date with main

## Testing

### Manual Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Works in Chrome, Firefox, Safari
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] Loading states display correctly
- [ ] Error states handled gracefully

### Testing Best Practices

- Test edge cases
- Test with empty data
- Test with large datasets
- Test offline behavior
- Test different user roles

## Documentation

### Code Documentation

````typescript
/**
 * Fetches a challenge by ID from the database
 *
 * @param id - The unique identifier of the challenge
 * @returns Promise resolving to Challenge object or null if not found
 * @throws {Error} If the database query fails
 *
 * @example
 * ```typescript
 * const challenge = await fetchChallenge('123');
 * if (challenge) {
 *   console.log(challenge.title);
 * }
 * ```
 */
async function fetchChallenge(id: string): Promise<Challenge | null> {
  // implementation
}
````

### Component Documentation

```typescript
/**
 * ChallengeCard - Displays a challenge summary card
 *
 * Features:
 * - Shows challenge title, difficulty, and completion status
 * - Clickable to navigate to challenge details
 * - Displays save/unsave button for authenticated users
 *
 * @param challenge - The challenge object to display
 * @param onSave - Optional callback when save button clicked
 */
export function ChallengeCard({ challenge, onSave }: ChallengeCardProps) {
  // implementation
}
```

## Questions or Need Help?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Join discussions in issue comments
- Be patient and respectful

## License

By contributing to RemWay, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing to RemWay! 🎉
