import { useQuery } from '@tanstack/react-query'
import { getSubmissionFeedback, type SubmissionWithFeedback } from '../api'
import { queryKeys } from '@/lib/queryConfig'

const POLLING_INTERVAL = 5000 // 5 seconds

export function useSubmissionFeedback(submissionId: string) {
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
    // Don't use placeholder data - we want fresh data on navigation
    // This prevents showing stale feedback after resubmission
    staleTime: 0,
  })
}
