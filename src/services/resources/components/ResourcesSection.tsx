import React from 'react'
import { BookOpen, Video, Wrench } from 'lucide-react'
import { ResourceGrid } from './ResourceGrid'
import { useResourceManagement } from '../hooks/useResourceManagement'
import { motion, AnimatePresence } from 'motion/react'

interface TabItem {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface ResourcesSectionProps {
  searchTerm?: string
  onSearchChange?: (value: string) => void
}

const tabs: TabItem[] = [
  { key: 'documentation', label: 'Documentation', icon: BookOpen },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'tools', label: 'Tools', icon: Wrench },
]

export function ResourcesSection({
  searchTerm = '',
  onSearchChange,
}: ResourcesSectionProps) {
  const { activeTab, setActiveTab, filteredData, loading, reload } =
    useResourceManagement(searchTerm)

  // Find active tab index for sliding indicator
  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab)

  return (
    <div className='w-full mt-6 md:mt-10'>
      <div className='w-full'>
        {/* Tab List with sliding indicator */}
        <div className='relative grid grid-cols-3 mb-6 md:mb-8 bg-card border shadow-sm h-10 md:h-12 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md'>
          {/* Animated sliding background */}
          <motion.div
            className='absolute top-0 bottom-0 bg-primary/10 z-0'
            initial={false}
            animate={{
              x: `${activeIndex * 100}%`,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            style={{ width: '33.333%' }}
          />
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() =>
                  setActiveTab(tab.key as 'video' | 'documentation' | 'tools')
                }
                className={`relative z-10 flex items-center justify-center gap-1 md:gap-2 h-full transition-all duration-200 px-1 cursor-pointer ${
                  activeTab === tab.key
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
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

        {/* Tab Content with Animation */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className='min-h-95'
          >
            <ResourceGrid
              items={filteredData}
              loading={loading}
              searchTerm={searchTerm}
              onClearSearch={
                onSearchChange ? () => onSearchChange('') : undefined
              }
              onRefresh={reload}
              activeTab={activeTab}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
