import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  description?: string
  badge?: string
  children?: ReactNode
}

export interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

export interface ButtonProps {
  children: ReactNode
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
}

export interface AnimateOnScrollProps {
  children: ReactNode
  animation?:
    | 'fade'
    | 'slide-up'
    | 'slide-down'
    | 'slide-left'
    | 'slide-right'
    | 'zoom'
  delay?: number
  className?: string
}

export interface TracingBeamProps {
  children: ReactNode
  className?: string
}

export interface ScrollToTopProps {
  threshold?: number
  smooth?: boolean
}
