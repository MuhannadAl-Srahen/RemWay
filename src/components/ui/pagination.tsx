import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from './button'
import { motion } from 'motion/react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (items: number) => void
  itemsPerPageOptions?: number[]
  showItemsPerPage?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [6, 9, 12, 18],
  showItemsPerPage = true,
  className = '',
}: PaginationProps) {
  // Filter options to only show values that make sense for the total items
  // Always include at least the first option and the current itemsPerPage
  const filteredOptions = itemsPerPageOptions.filter(
    (option, index) => index === 0 || option <= totalItems || option === itemsPerPage
  )

  // Don't render anything if there's only one page and items fit in first option
  if (totalPages <= 1 && totalItems <= itemsPerPageOptions[0]) {
    return null
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 ${className}`}
    >
      {/* Items info and per page selector */}
      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
        <span>
          Showing <span className='font-medium text-foreground'>{startItem}</span> to{' '}
          <span className='font-medium text-foreground'>{endItem}</span> of{' '}
          <span className='font-medium text-foreground'>{totalItems}</span> items
        </span>

        {showItemsPerPage && onItemsPerPageChange && filteredOptions.length > 1 && (
          <div className='flex items-center gap-2'>
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className='h-8 px-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            >
              {filteredOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className='flex items-center gap-1'>
          {/* First page */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className='h-8 w-8 hidden sm:flex'
            aria-label='Go to first page'
          >
            <ChevronsLeft className='h-4 w-4' />
          </Button>

          {/* Previous page */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='h-8 w-8'
            aria-label='Go to previous page'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>

          {/* Page numbers */}
          <div className='flex items-center gap-1'>
            {pageNumbers.map((page, index) =>
              page === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className='px-2 text-muted-foreground'
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size='icon'
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 text-sm ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : ''
                  }`}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </Button>
              )
            )}
          </div>

          {/* Next page */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='h-8 w-8'
            aria-label='Go to next page'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>

          {/* Last page */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className='h-8 w-8 hidden sm:flex'
            aria-label='Go to last page'
          >
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </motion.div>
  )
}


