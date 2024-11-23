import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { STALE_TIME, RETRY_CONFIG, CACHE_VALIDITY } from '@/lib/queryConfig'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  isAuthenticated: boolean
  session: Session | null
}

// Helper to get cached auth state from localStorage
const getCachedAuthState = (): AuthState | undefined => {
  try {
    const cached = localStorage.getItem('auth-state-cache')
    if (cached) {
      const parsed = JSON.parse(cached)
      // Check if cache is still valid using centralized config
      const cacheAge = Date.now() - (parsed.timestamp || 0)
      if (cacheAge < CACHE_VALIDITY.DEFAULT) {
        return parsed.data
      }
    }
  } catch (e) {
    console.error('Error reading auth cache:', e)
  }
  return undefined
}

// Helper to save auth state to localStorage
const setCachedAuthState = (data: AuthState) => {
  try {
    localStorage.setItem(
      'auth-state-cache',
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    )
  } catch (e) {
    console.error('Error saving auth cache:', e)
  }
}

export const useAuth = () => {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) throw error

      const result = { isAuthenticated: !!session, session }

      // Cache the result
      setCachedAuthState(result)

      return result
    },
    staleTime: STALE_TIME.AUTH,
    retry: RETRY_CONFIG.AUTH,
    // Use cached data as initial data to prevent flash
    initialData: getCachedAuthState,
  })
}
