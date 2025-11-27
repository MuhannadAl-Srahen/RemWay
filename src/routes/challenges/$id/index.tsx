import { useState, useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Palette, FileText, Upload } from 'lucide-react'
import { PageLayout } from '@/layouts'
import { getChallengeById } from '@/services/challenges/api'
import {
  ChallengeHero,
  ChallengeOverview,
  ChallengeDesign,
  ChallengeResources,
  ChallengeSubmission,
} from '@/services/challenges'
import { ChallengeDetailSkeleton } from '@/components/ui/challenge-detail-skeleton'

type TabType = 'overview' | 'design' | 'resources' | 'submission'

export const Route = createFileRoute('/challenges/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  // Load saved tab from sessionStorage
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = sessionStorage.getItem(`challenge-${id}-active-tab`)
    return (saved as TabType) || 'overview'
  })
  const navigate = useNavigate()

  // Save active tab to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(`challenge-${id}-active-tab`, activeTab)
  }, [activeTab, id])

  const {
    data: challenge,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['challenge', id],
    queryFn: () => getChallengeById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  })

  // Show skeleton loading state
  if (isLoading) {
    return (
      <PageLayout>
        <ChallengeDetailSkeleton />
      </PageLayout>
    )
  }

  if (error || !challenge) {
    return (
      <PageLayout>
        <div className='flex items-center justify-center min-h-[60dvh] px-4'>
          <div className='text-center max-w-md'>
            <div className='mb-8'>
              <div className='relative inline-block'>
                <FileText
                  className='absolute -top-3 -left-3 text-primary/20'
                  size={40}
                />
                <h1 className='text-7xl font-bold bg-linear-to-br from-primary to-primary/60 bg-clip-text text-transparent'>
                  404
                </h1>
                <FileText
                  className='absolute -bottom-3 -right-3 text-primary/20'
                  size={40}
                />
              </div>
            </div>
            <h2 className='text-2xl md:text-3xl font-bold text-foreground mb-4'>
              Challenge Not Found
            </h2>
            <p className='text-muted-foreground mb-8 leading-relaxed'>
              The challenge you're looking for doesn't exist or may have been
              removed. Let's get you back on track!
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <Button onClick={() => navigate({ to: '/challenges' })} size='lg'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Challenges
              </Button>
              <Button
                variant='outline'
                onClick={() => navigate({ to: '/' })}
                size='lg'
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'submission', label: 'Submit', icon: Upload },
  ] as const

  return (
    <PageLayout maxWidth='6xl'>
      {/* Back Button */}
      <Link to='/challenges'>
        <Button
          variant='ghost'
          className='mb-4 md:mb-6 transition-all duration-300 hover:scale-105'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          <span className='hidden sm:inline text-base'>Back to Challenges</span>
          <span className='sm:hidden'>Back</span>
        </Button>
      </Link>

      {/* Hero Section */}
      <ChallengeHero challenge={challenge} />

      {/* Custom Tabs */}
      <div className='w-full'>
        {/* Tab List */}
        <div className='grid grid-cols-4 mb-6 md:mb-8 bg-card border shadow-sm h-10 md:h-12 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1 md:gap-2 h-full transition-all duration-200 relative px-1 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary scale-100'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground hover:scale-[1.02]'
                }`}
              >
                <Icon className='h-3 w-3 md:h-4 md:w-4 shrink-0' />
                <span className='hidden sm:inline text-sm md:text-base'>
                  {tab.label}
                </span>
                <span className='sm:hidden text-xs font-medium'>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tab Contents */}
        <div className='space-y-4 md:space-y-6'>
          {activeTab === 'overview' && (
            <ChallengeOverview challenge={challenge} />
          )}
          {activeTab === 'design' && <ChallengeDesign challenge={challenge} />}
          {activeTab === 'resources' && (
            <ChallengeResources challenge={challenge} />
          )}
          {activeTab === 'submission' && (
            <ChallengeSubmission challenge={challenge} />
          )}
        </div>
      </div>
    </PageLayout>
  )
}
