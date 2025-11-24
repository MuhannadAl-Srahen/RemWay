import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { STALE_TIME, RETRY_CONFIG, CACHE_VALIDITY } from '@/lib/queryConfig'
import { ProfileService } from '../api'
import type { UserProfile } from '@/types'

// Helper to get cached profile from localStorage
const getCachedProfile = (userId?: string): UserProfile | null | undefined => {
  try {
    const key = userId || 'current-user'
    const cached = localStorage.getItem(`profile-cache-${key}`)
    if (cached) {
      const parsed = JSON.parse(cached)
      // Check if cache is still valid using centralized config
      const cacheAge = Date.now() - (parsed.timestamp || 0)
      if (cacheAge < CACHE_VALIDITY.DEFAULT) {
        return parsed.data
      }
    }
  } catch (e) {
    console.error('Error reading profile cache:', e)
  }
  return undefined
}

// Helper to save profile to localStorage
const setCachedProfile = (data: UserProfile | null, userId?: string) => {
  try {
    const key = userId || 'current-user'
    localStorage.setItem(
      `profile-cache-${key}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    )
  } catch (e) {
    console.error('Error saving profile cache:', e)
  }
}

export const useProfile = (userId?: string) => {
  return useQuery<UserProfile | null, Error>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const data = await ProfileService.getProfile(userId)
      // Cache the result
      setCachedProfile(data, userId)
      return data
    },
    staleTime: STALE_TIME.PROFILE,
    gcTime: STALE_TIME.PROFILE * 2, // Cache twice as long as stale time
    retry: RETRY_CONFIG.DEFAULT,
    enabled: !!userId || userId === undefined, // Allow fetching current user's profile
    // Use cached data as initial data to prevent flash
    initialData: () => getCachedProfile(userId),
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string
      updates: Partial<UserProfile>
    }) => {
      return ProfileService.updateProfile(userId, updates)
    },
    onSuccess: (data, variables) => {
      // Update the cache with the new profile data
      if (data) {
        queryClient.setQueryData(['profile', variables.userId], data)
        queryClient.setQueryData(['profile', undefined], data) // Also update current user query
      }
    },
    onError: (error) => {
      console.error('[useUpdateProfile] Mutation error:', error)
    },
  })
}
