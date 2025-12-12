import type { Challenge } from '@/types'
import { getChallengeDetails } from './lib/getChallengeDetails'
import { ProfileService } from '@/services/profile/api'
import { supabase } from '@/lib/supabaseClient'

export const getChallengeById = async (
  id: string
): Promise<Challenge | null> => {
  // Small delay kept for parity with previous behavior
  await new Promise((resolve) => setTimeout(resolve, 200))
  try {
    const result = await getChallengeDetails(id)
    if (!result)
      console.warn('[getChallengeById] no challenge found for id', id)
    return result
  } catch (err) {
    console.error('[getChallengeById] unexpected error', err)
    return null
  }
}

export const submitChallengeSolution = async (
  challengeId: string,
  submission: {
    title: string
    githubUrl: string
    liveUrl: string
    screenshot: File | null
    description: string
  }
) => {
  try {
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Verify that the GitHub repository belongs to the authenticated user
    const userGithubUsername = user.user_metadata?.user_name?.toLowerCase()
    if (!userGithubUsername) {
      throw new Error(
        'GITHUB_AUTH_REQUIRED: Unable to verify your GitHub identity. Please sign out and sign in again with GitHub.'
      )
    }

    // Extract username from GitHub URL (supports various formats)
    // e.g., https://github.com/username/repo, github.com/username/repo
    const githubUrlMatch = submission.githubUrl.match(
      /github\.com\/([^\/]+)\/[^\/]+/i
    )
    const submittedRepoOwner = githubUrlMatch?.[1]?.toLowerCase()

    if (!submittedRepoOwner) {
      throw new Error(
        'INVALID_GITHUB_URL: Unable to extract repository owner from the GitHub URL. Please provide a valid URL (e.g., https://github.com/username/repo).'
      )
    }

    if (submittedRepoOwner !== userGithubUsername) {
      throw new Error(
        `GITHUB_OWNERSHIP_ERROR: The repository "${submission.githubUrl}" belongs to "${submittedRepoOwner}", but you are signed in as "${userGithubUsername}". You can only submit repositories from your own GitHub account.`
      )
    }

    // Check if the live preview URL matches any official challenge URLs
    if (submission.liveUrl) {
      // Define the type for challenge_overview table
      type ChallengeOverview = {
        challenge_id: string
        livepreviewurl: string | null
      }
      const { data: officialChallenges } = await supabase
        .from('challenge_overview')
        .select('challenge_id, livepreviewurl')
        .not('livepreviewurl', 'is', null)

      if (officialChallenges && officialChallenges.length > 0) {
        const isOfficialUrl = officialChallenges.some(
          (challenge: ChallengeOverview) =>
            challenge.livepreviewurl &&
            challenge.livepreviewurl.toLowerCase() ===
              submission.liveUrl.toLowerCase()
        )

        if (isOfficialUrl) {
          throw new Error(
            `OFFICIAL_URL_USED: The live preview URL "${submission.liveUrl}" is an official challenge URL. You cannot submit the official solution as your own work.`
          )
        }
      }
    }

    // Check if URLs are already used for a DIFFERENT challenge by the SAME user
    // This prevents the user from accidentally submitting the same repo for multiple challenges
    const { data: existingWithGithub } = await supabase
      .from('challenge_submissions')
      .select('challenge_id, challenge_title')
      .eq('github_url', submission.githubUrl)
      .eq('profile_id', user.id)
      .neq('challenge_id', challengeId)
      .limit(1)

    if (existingWithGithub && existingWithGithub.length > 0) {
      const existingChallenge = existingWithGithub[0] as {
        challenge_id: string
        challenge_title: string
      }
      throw new Error(
        `GITHUB_URL_USED: The GitHub repository URL "${submission.githubUrl}" is already used for your submission to "${existingChallenge.challenge_title}". Please create a new repository for this challenge, or update your other submission if you used the wrong URL.`
      )
    }

    // Also check if the URL is used by a different user (to prevent copying)
    const { data: existingWithGithubOtherUser } = await supabase
      .from('challenge_submissions')
      .select('challenge_id')
      .eq('github_url', submission.githubUrl)
      .neq('profile_id', user.id)
      .limit(1)

    if (existingWithGithubOtherUser && existingWithGithubOtherUser.length > 0) {
      throw new Error(
        `GITHUB_URL_USED: The GitHub repository URL "${submission.githubUrl}" has already been submitted by another user. Please use your own repository.`
      )
    }

    const { data: existingWithLive } = await supabase
      .from('challenge_submissions')
      .select('challenge_id, challenge_title')
      .eq('live_site_url', submission.liveUrl)
      .eq('profile_id', user.id)
      .neq('challenge_id', challengeId)
      .limit(1)

    if (existingWithLive && existingWithLive.length > 0) {
      const existingChallenge = existingWithLive[0] as {
        challenge_id: string
        challenge_title: string
      }
      throw new Error(
        `LIVE_URL_USED: The live preview URL "${submission.liveUrl}" is already used for your submission to "${existingChallenge.challenge_title}". Please deploy this project to a different URL.`
      )
    }

    // Also check if the live site URL is used by a different user (to prevent copying)
    const { data: existingWithLiveOtherUser } = await supabase
      .from('challenge_submissions')
      .select('challenge_id')
      .eq('live_site_url', submission.liveUrl)
      .neq('profile_id', user.id)
      .limit(1)

    if (existingWithLiveOtherUser && existingWithLiveOtherUser.length > 0) {
      throw new Error(
        `LIVE_URL_USED: The live preview URL "${submission.liveUrl}" has already been submitted by another user. Please deploy your own solution to a unique URL.`
      )
    }
    // Check if user already has a submission for this challenge (for update flow)
    const { data: existingSubmission } = await supabase
      .from('challenge_submissions')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('profile_id', user.id)
      .maybeSingle()

    let submissionId: string
    let isUpdate = false

    if (existingSubmission) {
      // UPDATE existing submission
      submissionId = (existingSubmission as { id: string }).id
      isUpdate = true

      const updateData = {
        challenge_title: submission.title,
        github_url: submission.githubUrl,
        live_site_url: submission.liveUrl,
        submission_description: submission.description || null,
        submitted_at: new Date().toISOString(), // Update timestamp
      }

      const { error: updateError } = (await (
        supabase.from(
          'challenge_submissions'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any
      )
        .update(updateData)
        .eq('id', submissionId)) as { error: Error | null }

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(updateError.message)
      }

      // Note: Old feedback will be deleted by generateAndStoreFeedback
      // after it captures the previous feedback for comparison
      console.log(
        '[submitChallengeSolution] Updated submission for resubmission:',
        submissionId
      )
    } else {
      // INSERT new submission
      const { data, error } = await (
        supabase.from(
          'challenge_submissions'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any
      )
        .insert({
          challenge_id: challengeId,
          profile_id: user.id,
          challenge_title: submission.title,
          github_url: submission.githubUrl,
          live_site_url: submission.liveUrl,
          screenshots: null, // Will update after upload
          submission_description: submission.description || null,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Submission error:', error)
        throw new Error(error.message)
      }

      submissionId = (data as { id: string }).id
    }

    // Handle screenshot upload if provided
    if (submission.screenshot) {
      const fileExt = submission.screenshot.name.split('.').pop()
      const fileName = `${challengeId}/${user.id}/${submissionId}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('submission-screenshots')
        .upload(fileName, submission.screenshot)

      if (uploadError) {
        console.error('Screenshot upload error:', uploadError)
        // Continue without screenshot if upload fails
      } else if (uploadData) {
        const {
          data: { publicUrl },
        } = supabase.storage
          .from('submission-screenshots')
          .getPublicUrl(uploadData.path)

        // Update the submission with screenshot URL
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('challenge_submissions') as any)
          .update({ screenshots: [publicUrl] })
          .eq('id', submissionId)
      }
    }

    // If this was a new submission (not an update), record progress for the user on the learning path
    if (!isUpdate) {
      try {
        const challenge = await getChallengeById(challengeId)
        if (challenge) {
          const difficulty = challenge.difficulty // 'Beginner' | 'Intermediate' | 'Advanced'
          const pathId = difficulty.toLowerCase()

          // Count total challenges for this difficulty
          const { count } = await supabase
            .from('challenges')
            .select('id', { count: 'exact', head: true })
            .eq('difficulty', difficulty)

          const totalChallenges = (count as number) || 0

          // Get current profile to merge existing completedChallenges
          const currentProfile = await ProfileService.getProfile(user.id)
          const existingLP =
            (currentProfile && currentProfile.learningPaths) || {}
          const existingEntry = existingLP[pathId] || {
            started: true,
            progress: 0,
            completedChallenges: [],
          }

          const completedSet = new Set<string>(
            existingEntry.completedChallenges || []
          )
          completedSet.add(challengeId)
          const completedArr = Array.from(completedSet)

          const newProgress =
            totalChallenges > 0
              ? Math.round((completedArr.length / totalChallenges) * 100)
              : 0

          const lpUpdate = {
            [pathId]: {
              started: true,
              progress: newProgress,
              completedChallenges: completedArr,
            },
          }

          // Persist via ProfileService (it merges learningPaths into social_links)
          await ProfileService.updateProfile(user.id, {
            learningPaths: lpUpdate,
          })
        }
      } catch (err) {
        console.error('Failed to update learning path progress:', err)
        // Non-fatal; continue
      }
    }

    return {
      success: true,
      submissionId: submissionId,
      message: isUpdate
        ? 'Solution updated successfully'
        : 'Solution submitted successfully',
      isUpdate,
    } as const
  } catch (error) {
    console.error('Submit challenge solution error:', error)
    throw error
  }
}
