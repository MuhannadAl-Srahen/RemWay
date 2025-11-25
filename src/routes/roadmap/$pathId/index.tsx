import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { PageLayout } from '@/layouts/PageLayout'
import PathDetails from '@/services/roadmap/components/PathDetails'
import { Button } from '@/components/ui/button'
import { Map, ArrowLeft, Home } from 'lucide-react'

export const Route = createFileRoute('/roadmap/$pathId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { pathId } = Route.useParams()
  const navigate = useNavigate()

  // Validate pathId
  const validPaths = ['beginner', 'intermediate', 'advanced'] as const

  if (
    !validPaths.includes(pathId as 'beginner' | 'intermediate' | 'advanced')
  ) {
    return (
      <PageLayout>
        <div className='flex items-center justify-center min-h-[60vh] px-4'>
          <div className='text-center max-w-md'>
            <div className='mb-8'>
              <div className='relative inline-block'>
                <Map
                  className='absolute -top-3 -left-3 text-primary/20'
                  size={40}
                />
                <h1 className='text-7xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent'>
                  404
                </h1>
                <Map
                  className='absolute -bottom-3 -right-3 text-primary/20'
                  size={40}
                />
              </div>
            </div>
            <h2 className='text-2xl md:text-3xl font-bold text-foreground mb-4'>
              Learning Path Not Found
            </h2>
            <p className='text-muted-foreground mb-8 leading-relaxed'>
              The learning path you're looking for doesn't exist. Choose from
              Beginner, Intermediate, or Advanced paths.
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <Button onClick={() => navigate({ to: '/roadmap' })} size='lg'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Roadmap
              </Button>
              <Button asChild variant='outline' size='lg'>
                <Link to='/'>
                  <Home className='mr-2 h-4 w-4' />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout maxWidth='6xl'>
      <PathDetails
        pathId={pathId as 'beginner' | 'intermediate' | 'advanced'}
      />
    </PageLayout>
  )
}
