import { useQuery } from '@tanstack/react-query'
import { getChallenges } from '../lib/getChallenges'
import { STALE_TIME, RETRY_CONFIG } from '@/lib/queryConfig'
import type { ChallengeListItem } from '@/types'

export const useChallenges = () => {
  return useQuery<ChallengeListItem[], Error>({
    queryKey: ['challenges'],
    queryFn: getChallenges,
    staleTime: STALE_TIME.CHALLENGES,
    gcTime: STALE_TIME.CHALLENGES * 2, // Cache twice as long as stale time
    retry: RETRY_CONFIG.DEFAULT,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff up to 10s
  })
}
