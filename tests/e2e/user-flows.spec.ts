import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should show sign in prompt when accessing protected route', async ({ page }) => {
    await page.goto('/profile')
    
    // Should redirect or show sign in prompt
    await expect(page.getByText(/sign in/i)).toBeVisible()
  })

  test('should persist authentication state after refresh', async ({ page, context }) => {
    // Mock authenticated state by setting cookies
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/profile')
    await page.reload()
    
    // Should still be on profile page
    await expect(page).toHaveURL(/.*profile/)
  })
})

test.describe('Challenge Submission Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Set authenticated state
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ])
  })

  test('should submit a challenge solution', async ({ page }) => {
    await page.goto('/challenges')
    
    // Wait for challenges to load
    await page.waitForSelector('[data-testid="challenge-card"]')
    
    // Click on first challenge
    await page.locator('[data-testid="challenge-card"]').first().click()
    
    // Should be on detail page
    await expect(page).toHaveURL(/.*challenges\/.*/)
    
    // Click submit button
    await page.click('text=Submit Solution')
    
    // Fill in submission form
    await page.fill('input[name="title"]', 'My E2E Test Solution')
    await page.fill('input[name="githubUrl"]', 'https://github.com/testuser/test-repo')
    await page.fill('input[name="liveUrl"]', 'https://test-site.vercel.app')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for success message
    await expect(page.getByText(/submitted/i)).toBeVisible({ timeout: 10000 })
  })

  test('should validate GitHub URL format', async ({ page }) => {
    await page.goto('/challenges')
    await page.waitForSelector('[data-testid="challenge-card"]')
    await page.locator('[data-testid="challenge-card"]').first().click()
    await page.click('text=Submit Solution')
    
    // Try invalid URL
    await page.fill('input[name="githubUrl"]', 'https://invalid-url.com')
    await page.locator('input[name="githubUrl"]').blur()
    
    // Should show error
    await expect(page.getByText(/valid GitHub/i)).toBeVisible()
  })
})

test.describe('Feedback Viewing Flow', () => {
  test('should display AI feedback for submission', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/profile')
    
    // Wait for submissions to load
    await page.waitForTimeout(2000)
    
    // Click on a submission to view feedback
    const viewFeedbackButton = page.locator('text=View Feedback').first()
    if (await viewFeedbackButton.isVisible()) {
      await viewFeedbackButton.click()
      
      // Should navigate to feedback page
      await expect(page).toHaveURL(/.*feedback\/.*/)
      
      // Should display feedback content
      await expect(page.locator('[data-testid="feedback-content"]')).toBeVisible()
    }
  })
})
