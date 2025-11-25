import { useMemo } from 'react'
import {
  useAllProfileSubmissions,
  isPassingSubmission,
} from '@/services/profile/hooks/useProfileSubmissions'

/**
 * Hook to get the set of challenge IDs that the user has passed (score >= 45)
 * Used for roadmap unlock logic and profile progress
 */
export const usePassedChallenges = () => {
  const {
    data: submissions = [],
    isLoading,
    error,
  } = useAllProfileSubmissions()

  const passedChallengeIds = useMemo(() => {
    const passedSet = new Set<string>()

    for (const submission of submissions) {
      if (isPassingSubmission(submission)) {
        passedSet.add(submission.challengeId)
      }
    }

    return passedSet
  }, [submissions])

  return {
    passedChallengeIds,
    isLoading,
    error,
  }
}
