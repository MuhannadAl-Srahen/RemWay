import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Heart, Map } from 'lucide-react'

interface AuthPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignIn: () => void
  variant?: 'save' | 'roadmap'
}

export function AuthPromptDialog({
  open,
  onOpenChange,
  onSignIn,
  variant = 'save',
}: AuthPromptDialogProps) {
  const isRoadmap = variant === 'roadmap'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='max-w-md'>
        <AlertDialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
              {isRoadmap ? (
                <Map className='h-6 w-6 text-primary' />
              ) : (
                <Heart className='h-6 w-6 text-primary' />
              )}
            </div>
            <AlertDialogTitle className='text-2xl'>
              {isRoadmap
                ? 'Sign in to start your path'
                : 'Sign in to save challenges'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className='text-base text-muted-foreground'>
            {isRoadmap
              ? 'Create an account or sign in to start a learning path and track your progress. Your journey will be saved so you can pick up where you left off!'
              : "Create an account or sign in to save your favorite challenges and track your progress. It's quick and free!"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-2 sm:gap-0'>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Maybe Later
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onSignIn}
            className='bg-primary hover:bg-primary/90'
          >
            Sign In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
