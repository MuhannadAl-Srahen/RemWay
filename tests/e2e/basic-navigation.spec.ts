import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')
    
    // Check for main heading
    await expect(page.locator('h1')).toBeVisible()
    
    // Check for navigation
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should navigate to challenges page', async ({ page }) => {
    await page.goto('/')
    
    // Click on challenges link
    await page.click('text=Challenges')
    
    // Should be on challenges page
    await expect(page).toHaveURL(/.*challenges/)
  })

  test('should show sign in button when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Should see sign in button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })
})

test.describe('Challenges Page', () => {
  test('should display challenges list', async ({ page }) => {
    await page.goto('/challenges')
    
    // Wait for challenges to load
    await page.waitForSelector('[data-testid="challenge-card"]', { 
      timeout: 10000,
      state: 'visible' 
    })
    
    // Should have at least one challenge
    const challenges = await page.locator('[data-testid="challenge-card"]').count()
    expect(challenges).toBeGreaterThan(0)
  })

  test('should filter challenges by difficulty', async ({ page }) => {
    await page.goto('/challenges')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Click on beginner filter
    await page.click('text=Beginner')
    
    // Wait for filtered results
    await page.waitForTimeout(500)
    
    // Should show filtered challenges
    await expect(page.locator('[data-testid="challenge-card"]').first()).toBeVisible()
  })

  test('should navigate to challenge detail', async ({ page }) => {
    await page.goto('/challenges')
    
    // Wait for challenges to load
    await page.waitForSelector('[data-testid="challenge-card"]')
    
    // Click on first challenge
    await page.locator('[data-testid="challenge-card"]').first().click()
    
    // Should be on challenge detail page
    await expect(page).toHaveURL(/.*challenges\/.*/)
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Should see mobile menu toggle
    await expect(page.locator('[aria-label="Toggle menu"]')).toBeVisible()
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    // Should be accessible
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    
    // Should have full navigation
    await expect(page.locator('nav')).toBeVisible()
  })
})
