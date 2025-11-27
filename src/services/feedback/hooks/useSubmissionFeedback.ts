import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSubmissionFeedback, type SubmissionWithFeedback } from '../api'
import { queryKeys } from '@/lib/queryConfig'
import { useEffect } from 'react'

const POLLING_INTERVAL = 5000 // 5 seconds

export function useSubmissionFeedback(submissionId: string) {
  const queryClient = useQueryClient()
  
  // Clear any existing cache for this submission when the hook is first called
  // This ensures we always get fresh data and prevents stale feedback from showing
  useEffect(() => {
    // Remove any cached data for this submission to ensure fresh fetch
    queryClient.removeQueries({
      queryKey: queryKeys.submissionFeedback(submissionId),
      exact: true,
    })
  }, [submissionId, queryClient])
  
  return useQuery<SubmissionWithFeedback | null, Error>({
    queryKey: queryKeys.submissionFeedback(submissionId),
    queryFn: () => getSubmissionFeedback(submissionId),
    // Refetch every 5 seconds if status is pending or processing
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'pending' || data?.status === 'processing') {
        return POLLING_INTERVAL
      }
      return false
    },
    // CRITICAL: Prevent stale data from showing
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't keep old data in cache
    refetchOnMount: 'always', // Always refetch when component mounts
    placeholderData: undefined, // Never use placeholder data
  })
}
