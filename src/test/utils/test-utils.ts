import { vi, beforeEach, afterEach } from 'vitest'

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now()
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

/**
 * Create a mock file object for file upload tests
 */
export function createMockFile(
  name = 'test.png',
  size = 1024,
  type = 'image/png'
): File {
  const file = new File([''], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

/**
 * Mock fetch with custom response
 */
export function mockFetch(data: unknown, status = 200) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    } as Response)
  )
}

/**
 * Mock console methods to suppress logs during tests
 */
export function mockConsole() {
  const originalConsole = { ...console }
  
  beforeEach(() => {
    global.console = {
      ...console,
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
  })

  afterEach(() => {
    global.console = originalConsole
  })
}
