import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Home, ArrowLeft, Search, Compass } from 'lucide-react'

export const Route = createFileRoute('/404')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4'>
      <Card className='max-w-2xl w-full p-8 md:p-12 text-center space-y-8 shadow-2xl border-2'>
        {/* Error Code */}
        <div className='relative'>
          <h1 className='text-9xl md:text-[12rem] font-bold bg-gradient-to-br from-primary via-primary to-secondary bg-clip-text text-transparent animate-pulse'>
            404
          </h1>
          <div className='absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-primary to-secondary' />
        </div>

        {/* Error Message */}
        <div className='space-y-4'>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground'>
            Page Not Found
          </h2>
          <p className='text-lg text-muted-foreground max-w-md mx-auto leading-relaxed'>
            Oops! The page you're looking for seems to have wandered off into
            the digital void. Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center pt-4'>
          <Button
            onClick={() => navigate({ to: '/' })}
            size='lg'
            className='gap-2 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
          >
            <Home className='h-5 w-5' />
            Go Home
          </Button>

          <Button
            onClick={() => window.history.back()}
            variant='outline'
            size='lg'
            className='gap-2 px-8 hover:bg-muted transition-all duration-300 hover:scale-105'
          >
            <ArrowLeft className='h-5 w-5' />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className='pt-8 border-t border-border/50'>
          <p className='text-sm text-muted-foreground mb-4'>
            Or explore these popular sections:
          </p>
          <div className='flex flex-wrap gap-3 justify-center'>
            <Link
              to='/challenges'
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-all duration-300 hover:scale-105'
            >
              <Compass className='h-4 w-4' />
              Challenges
            </Link>
            <Link
              to='/roadmap'
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-all duration-300 hover:scale-105'
            >
              <Search className='h-4 w-4' />
              Roadmap
            </Link>
            <Link
              to='/resources'
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-all duration-300 hover:scale-105'
            >
              <Search className='h-4 w-4' />
              Resources
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
