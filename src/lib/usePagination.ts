import { useState, useEffect, useCallback } from 'react'

interface UsePaginationOptions {
  storageKey?: string
  defaultItemsPerPage?: number
  scrollTopOffset?: number
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
) {
  const {
    storageKey = 'pagination',
    defaultItemsPerPage = 9,
    scrollTopOffset = 200,
  } = options

  const pageKey = `${storageKey}-page`
  const itemsKey = `${storageKey}-items-per-page`

  // Initialize state from sessionStorage or defaults
  const [currentPage, setCurrentPage] = useState(() => {
    const stored = sessionStorage.getItem(pageKey)
    return stored ? parseInt(stored, 10) : 1
  })

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const stored = sessionStorage.getItem(itemsKey)
    return stored ? parseInt(stored, 10) : defaultItemsPerPage
  })

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  // Ensure current page is valid
  const validCurrentPage = Math.min(currentPage, totalPages)

  // Get paginated items
  const startIndex = (validCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = items.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(newPage)
      sessionStorage.setItem(pageKey, String(newPage))
      // Scroll to top of the list
      window.scrollTo({ top: scrollTopOffset, behavior: 'smooth' })
    },
    [totalPages, pageKey, scrollTopOffset]
  )

  // Handle items per page change
  const handleItemsPerPageChange = useCallback(
    (items: number) => {
      setItemsPerPage(items)
      setCurrentPage(1) // Reset to first page
      sessionStorage.setItem(itemsKey, String(items))
      sessionStorage.setItem(pageKey, '1')
    },
    [itemsKey, pageKey]
  )

  // Reset page (useful when filters change)
  const resetPage = useCallback(() => {
    setCurrentPage(1)
    sessionStorage.setItem(pageKey, '1')
  }, [pageKey])

  // Auto-reset page if it exceeds total pages (e.g., after filtering)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
      sessionStorage.setItem(pageKey, String(totalPages))
    }
  }, [currentPage, totalPages, pageKey])

  return {
    currentPage: validCurrentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handleItemsPerPageChange,
    resetPage,
  }
}
