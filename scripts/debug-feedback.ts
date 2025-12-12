import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Debugging Feedback System')
console.log('━'.repeat(80))

async function debug() {
  // 1. Check submissions
  console.log('\n📋 Step 1: Checking submissions...')
  const { data: submissions, error: subError } = await supabase
    .from('challenge_submissions')
    .select('id, github_url, live_site_url, challenge_id, submitted_at')
    .order('submitted_at', { ascending: false })
    .limit(5)

  if (subError) {
    console.error('❌ Submissions error:', subError)
  } else {
    console.log(`✅ Found ${submissions?.length || 0} submissions`)
    submissions?.forEach((sub, i) => {
      console.log(`\n   ${i + 1}. ${sub.id}`)
      console.log(`      GitHub: ${sub.github_url}`)
      console.log(`      Live: ${sub.live_site_url}`)
      console.log(`      Challenge ID: ${sub.challenge_id}`)
    })
  }

  // 2. Check feedback entries
  console.log('\n📋 Step 2: Checking feedback entries...')
  const { data: feedback, error: fbError } = await supabase
    .from('challenge_feedback')
    .select('id, submission_id, overall_score, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (fbError) {
    console.error('❌ Feedback error:', fbError)
  } else {
    console.log(`✅ Found ${feedback?.length || 0} feedback entries`)
    feedback?.forEach((fb, i) => {
      console.log(
        `   ${i + 1}. Score: ${fb.overall_score} (Submission: ${fb.submission_id})`
      )
    })
  }

  // 3. If we have a submission, try to generate feedback
  if (submissions && submissions.length > 0) {
    const latestSub = submissions[0]
    console.log(`\n🤖 Step 3: Testing feedback generation for: ${latestSub.id}`)
    console.log(`   GitHub: ${latestSub.github_url}`)

    // Check if feedback already exists for this submission
    const { data: existingFb } = await supabase
      .from('challenge_feedback')
      .select('id')
      .eq('submission_id', latestSub.id)
      .maybeSingle()

    if (existingFb) {
      console.log('   ⚠️ Feedback already exists for this submission')
    } else {
      console.log('   ℹ️ No feedback exists yet - you can generate it')
    }
  }

  console.log('\n━'.repeat(80))
  console.log('✅ Debug complete')
}

debug()
