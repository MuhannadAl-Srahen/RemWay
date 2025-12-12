import { Link, useSearch } from '@tanstack/react-router'
import { Map, BookOpen, Swords, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRef, useState, useEffect, useCallback } from 'react'

const navItems = [
  { name: 'Challenges', href: '/challenges', icon: Swords },
  { name: 'Roadmap', href: '/roadmap', icon: Map },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Progress', href: '/progress', icon: Trophy },
] as const

interface DesktopNavProps {
  pathname: string
}

export const DesktopNav = ({ pathname }: DesktopNavProps) => {
  // Get search params to check for profile?tab=progress
  const search = useSearch({ strict: false }) as { tab?: string } | undefined
  
  // Refs for each nav item to calculate positions
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  
  // State for the sliding indicator position/size
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  const getIsActive = useCallback((item: typeof navItems[number]) => {
    // Special case: Progress redirects to /profile?tab=progress
    if (item.href === '/progress') {
      return pathname === '/progress' || 
             (pathname === '/profile' && search?.tab === 'progress')
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }, [pathname, search?.tab])

  // Find active index
  const activeIndex = navItems.findIndex((item) => getIsActive(item))

  // Update indicator position when active item changes
  useEffect(() => {
    if (activeIndex >= 0 && navRefs.current[activeIndex] && containerRef.current) {
      const activeEl = navRefs.current[activeIndex]
      const containerEl = containerRef.current
      
      if (activeEl) {
        const containerRect = containerEl.getBoundingClientRect()
        const activeRect = activeEl.getBoundingClientRect()
        
        setIndicatorStyle({
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
        })
      }
    }
  }, [activeIndex, pathname, search?.tab])

  return (
    <nav className='hidden md:flex items-center'>
      {/* Navigation pill container */}
      <div 
        ref={containerRef}
        className='relative flex items-center gap-1 p-1.5 rounded-full bg-muted/60 backdrop-blur-md border border-border/50 shadow-sm'
      >
        {/* Animated sliding background - smooth like profile page tabs */}
        <div
          className={cn(
            'absolute top-1.5 bottom-1.5 bg-primary rounded-full shadow-lg shadow-primary/30',
            'transition-[left,width,opacity,transform] duration-500 ease-in-out',
            activeIndex < 0 && 'opacity-0 scale-95'
          )}
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            transform: activeIndex >= 0 ? 'scale(1)' : 'scale(0.95)',
          }}
        />

        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = getIsActive(item)
          
          return (
            <Link
              key={item.name}
              to={item.href}
              ref={(el) => { navRefs.current[index] = el }}
              className={cn(
                'group relative z-10 flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer select-none',
                'transition-all duration-200 ease-out',
                'active:scale-[0.97]',
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  'transition-all duration-200 ease-out',
                  isActive 
                    ? 'text-primary-foreground' 
                    : 'group-hover:text-primary group-hover:scale-110'
                )}
              />
              <span className='text-sm font-medium whitespace-nowrap'>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
