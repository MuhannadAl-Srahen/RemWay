import { useMemo } from 'react'
import {
  useAllProfileSubmissions,
  type ProfileSubmission,
  isPassingSubmission,
} from './useProfileSubmissions'
import type { ProfileStats } from '@/types'

/**
 * Calculates profile statistics from real submission data
 * Only counts challenges as "completed" if score >= PASSING_SCORE (45%)
 */
export const useProfileStats = () => {
  const { data: submissions, isLoading, error } = useAllProfileSubmissions()

  const stats = useMemo<ProfileStats>(() => {
    if (!submissions || submissions.length === 0) {
      return {
        challengesCompleted: 0,
        totalSubmissions: 0,
        averageRating: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
      }
    }

    // Get unique PASSED challenges (score >= PASSING_SCORE)
    // Only count a challenge as completed if the user passed it
    const completedChallenges = new Set(
      submissions
        .filter((s) => isPassingSubmission(s))
        .map((s) => s.challengeId)
    )

    // Calculate average score from all submissions with scores
    const submissionsWithScores = submissions.filter((s) => s.score !== null)
    const averageRating =
      submissionsWithScores.length > 0
        ? Math.round(
            submissionsWithScores.reduce((sum, s) => sum + (s.score || 0), 0) /
              submissionsWithScores.length
          )
        : 0

    // Calculate streaks based on PASSING submission dates only
    const passingSubmissions = submissions.filter((s) => isPassingSubmission(s))
    const { currentStreak, longestStreak } =
      calculateStreaks(passingSubmissions)

    // Calculate total points (only from passing submissions)
    const totalPoints = passingSubmissions.reduce(
      (sum, s) => sum + (s.score || 0),
      0
    )

    return {
      challengesCompleted: completedChallenges.size,
      totalSubmissions: submissions.length,
      averageRating,
      currentStreak,
      longestStreak,
      totalPoints,
    }
  }, [submissions])

  return {
    data: stats,
    isLoading,
    error,
    submissions,
  }
}

/**
 * Calculate current and longest streaks from submission dates
 * A streak is counted as consecutive days with at least one passing submission
 */
function calculateStreaks(submissions: ProfileSubmission[]): {
  currentStreak: number
  longestStreak: number
} {
  if (submissions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Get unique dates (in YYYY-MM-DD format) sorted newest to oldest
  const uniqueDates = [
    ...new Set(
      submissions.map((s) => {
        const date = new Date(s.submittedAt)
        // Use local date to avoid timezone issues
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })
    ),
  ].sort((a, b) => b.localeCompare(a)) // Sort descending (newest first)

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Helper to get date string for a Date object
  const getDateString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  // Helper to get the previous day
  const getPreviousDay = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00') // Use noon to avoid DST issues
    date.setDate(date.getDate() - 1)
    return getDateString(date)
  }

  // Calculate today and yesterday strings
  const now = new Date()
  const todayStr = getDateString(now)
  const yesterdayStr = getPreviousDay(todayStr)

  // Calculate current streak
  let currentStreak = 0
  const mostRecentDate = uniqueDates[0]

  // Current streak only counts if most recent submission is today or yesterday
  if (mostRecentDate === todayStr || mostRecentDate === yesterdayStr) {
    // Start counting from the most recent submission date
    let expectedDate = mostRecentDate

    for (const dateStr of uniqueDates) {
      if (dateStr === expectedDate) {
        currentStreak++
        expectedDate = getPreviousDay(expectedDate)
      } else if (dateStr < expectedDate) {
        // There's a gap, streak is broken
        break
      }
      // If dateStr > expectedDate, skip (duplicate or out of order, shouldn't happen)
    }
  }

  // Calculate longest streak (sort ascending for this)
  const sortedAsc = [...uniqueDates].sort((a, b) => a.localeCompare(b))

  let longestStreak = 1
  let tempStreak = 1

  for (let i = 1; i < sortedAsc.length; i++) {
    // Check if previous date is exactly one day before current
    const prevDate = new Date(sortedAsc[i - 1] + 'T12:00:00')
    prevDate.setDate(prevDate.getDate() + 1)
    const expectedDateStr = getDateString(prevDate)

    if (sortedAsc[i] === expectedDateStr) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Ensure current streak is not greater than longest
  longestStreak = Math.max(longestStreak, currentStreak)

  return { currentStreak, longestStreak }
}
