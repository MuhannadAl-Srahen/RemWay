import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { MainLayout } from '@/layouts/MainLayout'
import { AppProvider } from '@/providers/AppProvider'
import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <>
      <AppProvider>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </AppProvider>
      <TanStackRouterDevtools />
    </>
  )
}

function NotFoundComponent() {
  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-background via-background to-muted/20'>
      <div className='max-w-2xl w-full text-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 Number with Code Styling */}
          <motion.div
            className='mb-8'
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className='relative inline-block'>
              <Code2
                className='absolute -top-4 -left-4 text-primary/20'
                size={48}
              />
              <h1 className='text-9xl font-bold bg-linear-to-br from-primary to-primary/60 bg-clip-text text-transparent'>
                404
              </h1>
              <Code2
                className='absolute -bottom-4 -right-4 text-primary/20'
                size={48}
              />
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='space-y-4 mb-12'
          >
            <h2 className='text-3xl md:text-4xl font-bold text-foreground'>
              Page Not Found
            </h2>
            <p className='text-lg text-muted-foreground max-w-md mx-auto'>
              Looks like this challenge is too advanced! The page you're looking
              for doesn't exist or has been moved.
            </p>
          </motion.div>

          {/* Animated Code Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='bg-muted/50 backdrop-blur-sm rounded-lg p-6 mb-12 border border-border/50'
          >
            <code className='text-sm text-left block space-y-1'>
              <span className='text-muted-foreground'>{'// Error: '}</span>
              <span className='text-destructive'>RouteNotFoundException</span>
              <br />
              <span className='text-muted-foreground'>
                {'// The requested path could not be resolved'}
              </span>
              <br />
              <span className='text-muted-foreground'>
                {'// Status: '}
                <span className='text-yellow-500'>404</span>
              </span>
            </code>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className='flex flex-col sm:flex-row gap-4 justify-center items-center'
          >
            <Button asChild size='lg' className='min-w-40'>
              <Link to='/'>
                <Home className='mr-2 h-4 w-4' />
                Go Home
              </Link>
            </Button>

            <Button
              asChild
              variant='outline'
              size='lg'
              className='min-w-40'
            >
              <Link to='/challenges'>
                <Search className='mr-2 h-4 w-4' />
                Browse Challenges
              </Link>
            </Button>

            <Button
              variant='ghost'
              size='lg'
              onClick={() => window.history.back()}
              className='min-w-40'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className='mt-12 pt-8 border-t border-border/50'
          >
            <p className='text-sm text-muted-foreground mb-4'>
              Looking for something specific?
            </p>
            <div className='flex flex-wrap justify-center gap-4 text-sm'>
              <Link
                to='/roadmap'
                className='text-primary hover:underline underline-offset-4'
              >
                Learning Roadmap
              </Link>
              <span className='text-muted-foreground'>•</span>
              <Link
                to='/resources'
                className='text-primary hover:underline underline-offset-4'
              >
                Resources
              </Link>
              <span className='text-muted-foreground'>•</span>
              <Link
                to='/profile'
                search={{ tab: 'recent' }}
                className='text-primary hover:underline underline-offset-4'
              >
                Your Profile
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
