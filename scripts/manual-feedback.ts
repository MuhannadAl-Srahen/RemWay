import { createClient } from '@supabase/supabase-js'
import { generateAIFeedback } from '../src/services/ai/api'
import type { ChallengeSubmissionWithChallenge } from '../src/types/feedback'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const githubToken = process.env.VITE_GITHUB_TOKEN!

const supabase = createClient(supabaseUrl, supabaseKey)

// The submission you mentioned seeing in the database
// Replace with actual ID from Supabase dashboard
const submissionId = process.argv[2] || 'PASTE_SUBMISSION_ID_HERE'

console.log('🔧 Manual Feedback Generation Test')
console.log('━'.repeat(80))
console.log(`Submission ID: ${submissionId}`)
console.log(`GitHub Token: ${githubToken ? '✅ Present' : '❌ Missing'}`)
console.log()

async function manualGenerate() {
  if (submissionId === 'PASTE_SUBMISSION_ID_HERE') {
    console.log('❌ Please provide the submission ID!')
    console.log('')
    console.log('Usage: bun scripts/manual-feedback.ts <submission_id>')
    console.log('')
    console.log('You can find the submission ID in your Supabase dashboard:')
    console.log('1. Go to Table Editor > challenge_submissions')
    console.log('2. Find the row with github_url containing "beef_recipe"')
    console.log('3. Copy the "id" column value')
    return
  }

  try {
    // 1. Fetch submission with service role (bypass RLS)
    console.log('📥 Step 1: Fetching submission...')
    const { data: submission, error: subError } = await supabase
      .from('challenge_submissions')
      .select(
        `
        *,
        challenges (
          id,
          title,
          difficulty,
          description,
          thumbnail_url
        )
      `
      )
      .eq('id', submissionId)
      .single()

    if (subError) {
      console.error('❌ Supabase error:', subError)
      return
    }

    if (!submission) {
      console.error('❌ Submission not found')
      console.log('💡 Make sure the ID is correct and RLS allows access')
      return
    }

    console.log('✅ Submission found!')
    console.log(`   GitHub: ${submission.github_url}`)
    console.log(`   Live: ${submission.live_site_url}`)
    console.log()

    // Fix challenge data structure
    const submissionData = submission as any
    if (!submissionData.challenge && submissionData.challenges) {
      submissionData.challenge = submissionData.challenges
    }

    console.log(`   Challenge: ${submissionData.challenge?.title || 'Unknown'}`)
    console.log()

    // 2. Get requirements
    console.log('📋 Step 2: Fetching requirements...')
    const { data: overview } = await supabase
      .from('challenge_overview')
      .select('requirements')
      .eq('challenge_id', submission.challenge_id)
      .maybeSingle()

    const requirements = (overview as any)?.requirements || []
    console.log(`   Found ${requirements.length} requirements`)
    console.log()

    // 3. Generate AI feedback
    console.log('🤖 Step 3: Generating AI feedback...')
    console.log('   (This may take 20-30 seconds)')
    console.log()

    const startTime = Date.now()

    const feedback = await generateAIFeedback({
      submission: submissionData as ChallengeSubmissionWithChallenge,
      challengeDescription: submissionData.challenge?.description || '',
      designRequirements: requirements,
      techRequirements: requirements,
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`✅ Generated in ${duration}s`)
    console.log()
    console.log('━'.repeat(80))
    console.log('📊 FEEDBACK RESULTS')
    console.log('━'.repeat(80))
    console.log(
      `Score: ${feedback.overallScore}/100 (${feedback.overallRating})`
    )
    console.log()
    console.log('Strengths:', feedback.whatYouDidWell?.length || 0, 'items')
    console.log(
      'Improvements:',
      feedback.areasForImprovement?.length || 0,
      'items'
    )
    console.log()

    // 4. Store in database
    console.log('💾 Step 4: Storing feedback...')

    const feedbackData = {
      submission_id: submissionId,
      overall_score: feedback.overallScore,
      overall_rating: feedback.overallRating,
      overall_good_practices: feedback.whatYouDidWell || [],
      improvment_advices: feedback.areasForImprovement || [],
      best_practices: (feedback.techAnalysis?.bestPractices || []).map(
        (item: any) => `${item.category}: ${item.description} (${item.status})`
      ),
      code_formatting: (feedback.techAnalysis?.codeFormatting || []).map(
        (item: any) => `${item.category}: ${item.description} (${item.status})`
      ),
      functionality: (feedback.techAnalysis?.functionality || []).map(
        (item: any) => `${item.category}: ${item.description} (${item.status})`
      ),
      accessibility: (feedback.techAnalysis?.accessibility || []).map(
        (item: any) => `${item.category}: ${item.description} (${item.status})`
      ),
      recommended_resources: feedback.recommendations?.learningResources || [],
      recommended_next_challenge:
        feedback.recommendations?.nextChallenges?.[0]?.title || null,
      overall_analysis_description: {
        designNotes: feedback.designComparison?.designNotes || [],
        matchesDesign: feedback.designComparison?.matchesDesign || false,
      },
      ai_model_version: 'gemini-2.5-pro',
      feedback_generation_time: Date.now() - startTime,
      live_preview: submission.live_site_url || '',
      view_code: submission.github_url,
    }

    const { data: inserted, error: insertError } = await supabase
      .from('challenge_feedback')
      .insert(feedbackData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Insert error:', insertError)
      return
    }

    console.log('✅ Feedback stored successfully!')
    console.log(`   Feedback ID: ${inserted.id}`)
    console.log()
    console.log('🔗 View at: http://localhost:5000/feedback/' + submissionId)
    console.log()
    console.log('🎉 Done!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

manualGenerate()
