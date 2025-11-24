import { useQuery } from '@tanstack/react-query'
import { getResources } from '../api'
import { STALE_TIME, RETRY_CONFIG } from '@/lib/queryConfig'
import type { ResourceItem } from '@/types'

export const useResources = (type: 'video' | 'documentation' | 'tools') => {
  return useQuery<ResourceItem[], Error>({
    queryKey: ['resources', type],
    queryFn: () => getResources(type),
    staleTime: STALE_TIME.RESOURCES,
    gcTime: STALE_TIME.RESOURCES * 2, // Cache twice as long as stale time
    retry: RETRY_CONFIG.DEFAULT,
  })
}
