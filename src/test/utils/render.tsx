import { render as rtlRender } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import type { ReactElement, ReactNode } from 'react'
import userEvent from '@testing-library/user-event'

// Create a test query client with no retries and no caching
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function render(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    )
  }

  const user = userEvent.setup()
  return {
    user,
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// Re-export testing library utilities
export { screen, waitFor, within, fireEvent } from '@testing-library/react'
