import { createFileRoute } from '@tanstack/react-router'
import {
  HeroSection,
  FeatureSection,
  HowWorkSection,
  ChallengeSection,
  CIASection,
} from '@/services/home'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className='relative'>
      {/* Hero Section - Full Screen */}
      <HeroSection />

      {/* Other Sections with Proper Spacing */}
      <div className='relative z-10 bg-background'>
        <FeatureSection />
        <HowWorkSection />
        <ChallengeSection />
        <CIASection />
      </div>
    </div>
  )
}
