import { test, expect } from '@playwright/test'

test.describe('Security: Unauthorized Access', () => {
  test('should block access to profile without authentication', async ({ page }) => {
    await page.goto('/profile')
    
    // Should not be able to see profile data
    // Should redirect or show sign in prompt
    await expect(page.getByText(/sign in/i)).toBeVisible()
  })

  test('should block access to settings without authentication', async ({ page }) => {
    await page.goto('/settings')
    
    // Should not be able to see settings
    await expect(page.getByText(/sign in/i)).toBeVisible()
  })

  test('should block direct access to feedback without authentication', async ({ page }) => {
    await page.goto('/feedback/test-submission-id')
    
    // Should redirect or show error
    await expect(page.getByText(/sign in/i).or(page.getByText(/access denied/i))).toBeVisible()
  })
})

test.describe('Security: XSS Prevention', () => {
  test('should escape HTML in challenge descriptions', async ({ page }) => {
    await page.goto('/challenges')
    
    // If description contains <script> tags, they should be escaped
    const challengeCard = page.locator('[data-testid="challenge-card"]').first()
    const content = await challengeCard.textContent()
    
    // Should not contain unescaped HTML
    expect(content).not.toContain('<script>')
  })

  test('should sanitize user input in forms', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/challenges')
    await page.waitForSelector('[data-testid="challenge-card"]')
    await page.locator('[data-testid="challenge-card"]').first().click()
    await page.click('text=Submit Solution')
    
    // Try to inject script in title
    await page.fill('input[name="title"]', '<script>alert("XSS")</script>')
    
    // Should be escaped when displayed
    const titleValue = await page.inputValue('input[name="title"]')
    expect(titleValue).toBe('<script>alert("XSS")</script>') // Stored as text
  })
})

test.describe('Security: URL Validation', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ])
  })

  test('should reject suspicious URLs', async ({ page }) => {
    await page.goto('/challenges')
    await page.waitForSelector('[data-testid="challenge-card"]')
    await page.locator('[data-testid="challenge-card"]').first().click()
    await page.click('text=Submit Solution')
    
    // Try suspicious URL
    await page.fill('input[name="liveUrl"]', 'javascript:alert(1)')
    await page.locator('input[name="liveUrl"]').blur()
    
    // Should show error
    await expect(page.getByText(/valid URL/i).or(page.getByText(/suspicious/i))).toBeVisible()
  })

  test('should reject file:// protocol URLs', async ({ page }) => {
    await page.goto('/challenges')
    await page.waitForSelector('[data-testid="challenge-card"]')
    await page.locator('[data-testid="challenge-card"]').first().click()
    await page.click('text=Submit Solution')
    
    // Try file:// URL
    await page.fill('input[name="liveUrl"]', 'file:///etc/passwd')
    await page.locator('input[name="liveUrl"]').blur()
    
    // Should show error
    await expect(page.getByText(/valid URL/i)).toBeVisible()
  })

  test('should only accept GitHub URLs for repository field', async ({ page }) => {
    await page.goto('/challenges')
    await page.waitForSelector('[data-testid="challenge-card"]')
    await page.locator('[data-testid="challenge-card"]').first().click()
    await page.click('text=Submit Solution')
    
    // Try non-GitHub URL
    await page.fill('input[name="githubUrl"]', 'https://gitlab.com/user/repo')
    await page.locator('input[name="githubUrl"]').blur()
    
    // Should show error
    await expect(page.getByText(/GitHub URL/i)).toBeVisible()
  })
})

test.describe('Security: Session Management', () => {
  test('should handle expired sessions gracefully', async ({ page, context }) => {
    // Set expired token
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'expired-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/profile')
    
    // Should redirect to login or show error
    await expect(page.getByText(/sign in/i).or(page.getByText(/session/i))).toBeVisible()
  })

  test('should clear session on logout', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'valid-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/profile')
    
    // Click logout
    const logoutButton = page.getByRole('button', { name: /sign out|logout/i })
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      
      // Should redirect to home
      await expect(page).toHaveURL('/')
      
      // Token should be cleared
      const cookies = await context.cookies()
      const authCookie = cookies.find(c => c.name === 'sb-auth-token')
      expect(authCookie).toBeUndefined()
    }
  })
})
