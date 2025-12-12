import { Button } from '@/components/ui/button'
import { MoonStarIcon, SunIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  theme: string | undefined
  toggleTheme: () => void
  className?: string
  variant?: 'desktop' | 'mobile'
}

export const ThemeToggle = ({
  theme,
  toggleTheme,
  className,
  variant = 'desktop',
}: ThemeToggleProps) => {
  if (variant === 'mobile') {
    return (
      <Button
        variant='ghost'
        size='default'
        onClick={toggleTheme}
        className={cn(
          'flex items-center justify-center w-11 h-11 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 group cursor-pointer hover:scale-105 active:scale-95',
          className
        )}
        aria-label='Toggle theme'
      >
        {theme === 'dark' ? (
          <MoonStarIcon className='text-blue-500 transition-all duration-500 ease-out group-hover:-rotate-12 group-hover:scale-110' />
        ) : (
          <SunIcon className='text-amber-500 transition-all duration-500 ease-out group-hover:rotate-12 group-hover:scale-110' />
        )}
      </Button>
    )
  }

  return (
    <Button
      onClick={toggleTheme}
      variant='ghost'
      size='icon'
      className={cn(
        'hidden md:flex h-10 w-10 rounded-full cursor-pointer select-none',
        'transition-all duration-300 ease-out',
        'hover:bg-muted/60 hover:scale-110 hover:shadow-md',
        'active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary/30',
        className
      )}
      aria-label='Toggle theme'
    >
      <div className='relative'>
        <SunIcon
          className={cn(
            'h-5 w-5 transition-all duration-500 ease-out',
            theme === 'dark'
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100 text-amber-500 hover:rotate-45'
          )}
        />
        <MoonStarIcon
          className={cn(
            'h-5 w-5 absolute inset-0 transition-all duration-500 ease-out',
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100 text-blue-400'
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
    </Button>
  )
}
