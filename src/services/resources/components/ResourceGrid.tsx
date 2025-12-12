import { ResourceCard } from './ResourceCards'
import { EmptyState } from '@/layouts'
import type { ResourceItem } from '@/types'
import { ResourceCardSkeleton } from '@/components/ui/resource-skeleton'
import { motion } from 'motion/react'
import { Pagination } from '@/components/ui/pagination'
import { usePagination } from '@/lib/usePagination'
import { useEffect } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
}

export interface ResourceGridProps {
  items: ResourceItem[]
  loading?: boolean
  searchTerm?: string
  onClearSearch?: () => void
  onRefresh?: () => void
  activeTab?: string
}

export function ResourceGrid({
  items,
  loading = false,
  searchTerm,
  onClearSearch,
  onRefresh,
  activeTab = 'all',
}: ResourceGridProps) {
  // Pagination with unique storage key per tab
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handleItemsPerPageChange,
    resetPage,
  } = usePagination(items, {
    storageKey: `resources-${activeTab}`,
    defaultItemsPerPage: 9,
  })

  // Reset page when search term or items change significantly
  useEffect(() => {
    resetPage()
  }, [searchTerm, activeTab, resetPage])
  // Show skeleton loading state
  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {Array.from({ length: 6 }).map((_, index) => (
          <ResourceCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  // Show EmptyState when no items are found and there's a search term
  if (items.length === 0 && searchTerm && searchTerm.trim() !== '') {
    return (
      <EmptyState
        title='No resources found'
        searchTerm={searchTerm}
        buttonText='Clear Search'
        onAction={onClearSearch || (() => {})}
      />
    )
  }

  // Show message when no items available
  if (items.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-lg text-muted-foreground mb-2'>
          No resources available
        </p>
        <p className='text-sm text-muted-foreground'>
          Check back later for new resources
        </p>
        {onRefresh ? (
          <div className='mt-4'>
            <button
              className='btn btn-sm'
              onClick={() => onRefresh && onRefresh()}
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <motion.div
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        key={`${activeTab}-${currentPage}-${paginatedItems.length}`}
      >
        {paginatedItems.map((resource, index) => (
          <motion.div key={index} variants={itemVariants}>
            <ResourceCard resource={resource} />
          </motion.div>
        ))}
      </motion.div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPageOptions={[6, 9, 12, 18]}
      />
    </>
  )
}
