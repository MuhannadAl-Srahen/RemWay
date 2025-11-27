/**
 * AI Scoring Consistency Test
 * 
 * This script tests that the AI gives consistent scores for the same submission.
 * Run with: bun run scripts/test-ai-consistency.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// Test configuration
const TEST_CONFIG = {
  // Number of times to run the same analysis
  iterations: 3,
  // Maximum acceptable score variance (e.g., 5 points)
  maxVariance: 5,
  // API key from environment
  apiKey: process.env.VITE_GEMINI_API_KEY || '',
}

// Sample submission data for testing
const SAMPLE_SUBMISSION = {
  challengeTitle: 'E-commerce Product Card',
  challengeDifficulty: 'Beginner',
  challengeDescription: 'Create a responsive product card with image, title, price, and add to cart button.',
  githubUrl: 'https://github.com/test/sample-project',
  liveUrl: 'https://sample-project.vercel.app',
  // Simulated code content
  codeContent: `
// Sample HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Card</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="product-card">
    <img src="product.jpg" alt="Product Image" class="product-image">
    <h2 class="product-title">Premium Headphones</h2>
    <p class="product-price">$149.99</p>
    <button class="add-to-cart">Add to Cart</button>
  </div>
</body>
</html>

// Sample CSS
.product-card {
  max-width: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px;
  font-family: Arial, sans-serif;
}

.product-image {
  width: 100%;
  border-radius: 4px;
}

.product-title {
  font-size: 1.25rem;
  margin: 12px 0 8px;
}

.product-price {
  color: #2563eb;
  font-weight: bold;
  font-size: 1.5rem;
}

.add-to-cart {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.add-to-cart:hover {
  background: #1d4ed8;
}
`,
}

const SYSTEM_PROMPT = `You are an expert frontend development mentor providing detailed feedback on coding challenge submissions.

CRITICAL: You MUST provide consistent, deterministic scoring. The same code should always receive the same score.

Scoring Guidelines:
- 90-100 (Excellent): Production-ready code, follows all best practices
- 75-89 (Good): Solid implementation, minor improvements possible
- 60-74 (Needs Improvement): Core functionality works but has notable issues
- Below 60: Significant problems

Return JSON with:
{
  "overallScore": number (0-100),
  "overallRating": "excellent" | "good" | "needs_improvement",
  "keyStrengths": ["strength1", "strength2"],
  "keyImprovements": ["improvement1", "improvement2"]
}`

async function runAnalysis(genAI: GoogleGenerativeAI, iteration: number): Promise<{ score: number; rating: string }> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: SYSTEM_PROMPT,
  })

  const prompt = `Analyze this frontend challenge submission:

**Challenge:** ${SAMPLE_SUBMISSION.challengeTitle} (${SAMPLE_SUBMISSION.challengeDifficulty})
${SAMPLE_SUBMISSION.challengeDescription}

**Source Code:**
${SAMPLE_SUBMISSION.codeContent}

Provide your analysis as JSON.`

  // Retry up to 3 times on transient errors
  for (let retry = 0; retry < 3; retry++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          // DETERMINISTIC SETTINGS - same as production
          temperature: 0,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      })

      const text = result.response.text()
      
      // Try to parse JSON, handle truncated responses
      let feedback: { overallScore: number; overallRating: string }
      try {
        feedback = JSON.parse(text)
      } catch (parseError) {
        console.log(`  ⚠️ JSON parse error on retry ${retry + 1}, response length: ${text.length}`)
        
        // Try to repair truncated JSON
        if (text.includes('{') && !text.trim().endsWith('}')) {
          const repaired = text.trim().replace(/,\s*$/, '') + '}'
          try {
            feedback = JSON.parse(repaired)
            console.log(`  ✅ Repaired JSON successfully`)
          } catch {
            if (retry < 2) {
              console.log(`  ⏳ Retrying due to parse error...`)
              await new Promise(resolve => setTimeout(resolve, 3000))
              continue
            }
            throw parseError
          }
        } else {
          throw parseError
        }
      }

      console.log(`\nIteration ${iteration}:`)
      console.log(`  Score: ${feedback.overallScore}`)
      console.log(`  Rating: ${feedback.overallRating}`)

      return {
        score: feedback.overallScore,
        rating: feedback.overallRating,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Check if it's a retryable error (503, rate limit, etc.)
      if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('rate')) {
        console.log(`  ⏳ Retry ${retry + 1}/3 - API temporarily unavailable, waiting 10s...`)
        await new Promise(resolve => setTimeout(resolve, 10000))
        continue
      }
      
      throw error
    }
  }
  
  throw new Error('Failed after 3 retries')
}

async function runConsistencyTest() {
  console.log('='.repeat(60))
  console.log('AI SCORING CONSISTENCY TEST')
  console.log('='.repeat(60))

  if (!TEST_CONFIG.apiKey) {
    console.error('\n❌ ERROR: VITE_GEMINI_API_KEY not set')
    console.log('Please set the environment variable and try again.')
    process.exit(1)
  }

  const genAI = new GoogleGenerativeAI(TEST_CONFIG.apiKey)

  console.log(`\nRunning ${TEST_CONFIG.iterations} iterations with identical input...`)
  console.log(`Max acceptable variance: ${TEST_CONFIG.maxVariance} points`)

  const results: { score: number; rating: string }[] = []

  for (let i = 1; i <= TEST_CONFIG.iterations; i++) {
    try {
      const result = await runAnalysis(genAI, i)
      results.push(result)

      // Small delay between requests to avoid rate limiting
      if (i < TEST_CONFIG.iterations) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.error(`\n❌ Iteration ${i} failed:`, error)
      process.exit(1)
    }
  }

  // Analyze results
  console.log('\n' + '='.repeat(60))
  console.log('RESULTS ANALYSIS')
  console.log('='.repeat(60))

  const scores = results.map(r => r.score)
  const ratings = results.map(r => r.rating)

  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = maxScore - minScore

  console.log(`\nScores: ${scores.join(', ')}`)
  console.log(`Ratings: ${ratings.join(', ')}`)
  console.log(`\nMin Score: ${minScore}`)
  console.log(`Max Score: ${maxScore}`)
  console.log(`Average: ${avgScore.toFixed(1)}`)
  console.log(`Variance: ${variance}`)

  // Check if all ratings are the same
  const allRatingsSame = ratings.every(r => r === ratings[0])

  console.log('\n' + '='.repeat(60))
  console.log('TEST RESULTS')
  console.log('='.repeat(60))

  if (variance <= TEST_CONFIG.maxVariance && allRatingsSame) {
    console.log('\n✅ PASS: AI scoring is consistent!')
    console.log(`   Score variance (${variance}) is within acceptable range (${TEST_CONFIG.maxVariance})`)
    console.log(`   All ratings are identical: ${ratings[0]}`)
    process.exit(0)
  } else {
    console.log('\n❌ FAIL: AI scoring is inconsistent!')
    if (variance > TEST_CONFIG.maxVariance) {
      console.log(`   Score variance (${variance}) exceeds acceptable range (${TEST_CONFIG.maxVariance})`)
    }
    if (!allRatingsSame) {
      console.log(`   Ratings are not consistent: ${ratings.join(', ')}`)
    }
    process.exit(1)
  }
}

// Run the test
runConsistencyTest().catch(console.error)
