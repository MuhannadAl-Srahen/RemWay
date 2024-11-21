import type { UserProfile, DbProfile } from '@/types'
import { supabase } from '@/lib/supabaseClient'

// Profile API service
export const ProfileService = {
  // Get user profile from Supabase
  async getProfile(userId?: string): Promise<UserProfile | null> {
    try {
      // If no userId provided, get current user
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return null
        userId = user.id
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[ProfileService] Error fetching profile:', error)
        return null
      }

      if (!data) {
        return null
      }

      // Map database profile to UserProfile type
      const dbProfile = data as DbProfile
      const socialLinks = dbProfile.social_links as Record<
        string,
        string
      > | null

      const profile: UserProfile = {
        id: dbProfile.id,
        username: dbProfile.full_name?.split(' ')[0].toLowerCase() || 'user',
        fullName: dbProfile.full_name || 'Unknown User',
        email: dbProfile.email || '',
        avatar: dbProfile.profile_image_url || undefined,
        bio: dbProfile.bio || undefined,
        location: socialLinks?.location || undefined,
        website: socialLinks?.website || undefined,
        githubUrl: dbProfile.github_url || socialLinks?.github || undefined,
        linkedinUrl: socialLinks?.linkedin || undefined,
        twitterUrl: socialLinks?.twitter || undefined,
        skills: dbProfile.skills || [],
        experience: 'Intermediate', // Default value, you can add this to your schema
        joinedAt:
          dbProfile.joined_date || new Date().toISOString().split('T')[0],
        stats: {
          challengesCompleted: 0, // TODO: Calculate from saved_challenges
          totalSubmissions: 0,
          averageRating: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0,
        },
        // expose any learning path state saved in social_links
        learningPaths:
          (socialLinks &&
            (socialLinks.learningPaths as unknown as Record<
              string,
              {
                started: boolean
                progress: number
                completedChallenges: string[]
              }
            >)) ||
          undefined,
      }

      return profile
    } catch (error) {
      console.error('[ProfileService] Exception:', error)
      return null
    }
  },

  // Update user profile
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      // First, get existing profile to merge social links properly
      const { data: existingProfile } = (await supabase
        .from('profiles')
        .select('social_links')
        .eq('id', userId)
        .single()) as { data: Pick<DbProfile, 'social_links'> | null }

      // Map UserProfile updates to database schema
      const dbUpdates: Partial<DbProfile> = {}

      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio
      if (updates.skills !== undefined) dbUpdates.skills = updates.skills
      if (updates.avatar !== undefined)
        dbUpdates.profile_image_url = updates.avatar
      if (updates.githubUrl !== undefined)
        dbUpdates.github_url = updates.githubUrl

      // Handle social links - merge with existing ones
      if (
        updates.linkedinUrl !== undefined ||
        updates.twitterUrl !== undefined ||
        updates.website !== undefined ||
        updates.location !== undefined ||
        // allow passing learningPaths as part of updates
        'learningPaths' in updates
      ) {
        // Get existing social links (may contain nested objects such as learningPaths)
        const existingSocialLinks: Record<string, unknown> =
          (existingProfile?.social_links as Record<string, unknown>) || {}

        // Merge with new simple string values
        const socialLinks: Record<string, unknown> = { ...existingSocialLinks }
        if (updates.linkedinUrl !== undefined)
          socialLinks.linkedin = updates.linkedinUrl
        if (updates.twitterUrl !== undefined)
          socialLinks.twitter = updates.twitterUrl
        if (updates.website !== undefined) socialLinks.website = updates.website
        if (updates.location !== undefined)
          socialLinks.location = updates.location
        // merge learningPaths if provided
        if ('learningPaths' in updates && updates.learningPaths) {
          const existingLP =
            (socialLinks.learningPaths as Record<string, unknown>) || {}
          const incomingLP = updates.learningPaths as Record<string, unknown>
          socialLinks.learningPaths = {
            ...existingLP,
            ...incomingLP,
          }
        }

        dbUpdates.social_links = socialLinks
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('profiles') as any)
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('[ProfileService] Error updating profile:', error)
        throw error
      }

      // Return the updated profile
      return await this.getProfile(userId)
    } catch (error) {
      console.error('[ProfileService] Exception:', error)
      return null
    }
  },

  // Update profile stats (when challenges are completed, etc.)
  async updateStats(): Promise<void> {
    // TODO: Implement stats tracking in a separate table or jsonb field
  },
}
