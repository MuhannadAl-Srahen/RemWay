/**
 * Centralized auth subscription manager
 * Ensures only ONE auth listener exists globally to prevent duplicate updates
 */
import { supabase } from './supabaseClient'
import type { QueryClient } from '@tanstack/react-query'

let authSubscription: { unsubscribe: () => void } | null = null
let isInitialized = false

/**
 * Initialize the global auth subscription
 * Call this once in your app's root component (AppProvider)
 */
export function initAuthSubscription(queryClient: QueryClient) {
  // Prevent multiple initializations
  if (isInitialized) {
    return
  }

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      // Update the auth query cache when auth state changes
      queryClient.setQueryData(['auth'], {
        isAuthenticated: !!session,
        session,
      })

      // Invalidate related queries on logout
      if (!session) {
        queryClient.invalidateQueries({ queryKey: ['profile'] })
        queryClient.invalidateQueries({ queryKey: ['savedChallenges'] })
      }
    }
  )

  authSubscription = listener.subscription
  isInitialized = true
}

/**
 * Cleanup the auth subscription
 * Call this if you need to manually cleanup (normally not needed)
 */
export function cleanupAuthSubscription() {
  if (authSubscription && typeof authSubscription.unsubscribe === 'function') {
    authSubscription.unsubscribe()
    authSubscription = null
    isInitialized = false
  }
}
