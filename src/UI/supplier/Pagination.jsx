import React from 'react';

export default function Pagination({ 
  page, 
  totalPages, 
  onPageChange, 
  showPageNumbers = true,
  maxVisiblePages = 5,
  className = '' 
}) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, page - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  const handleKeyDown = (e, targetPage) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPageChange(targetPage);
    }
  };

  return (
    <nav 
      className={`flex items-center justify-center gap-1 sm:gap-2 mt-4 sm:mt-6 ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* First Page - Hidden on mobile */}
      <button
        className="hidden sm:block px-2 sm:px-3 py-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        disabled={isFirstPage}
        onClick={() => onPageChange(1)}
        onKeyDown={(e) => handleKeyDown(e, 1)}
        aria-label="Go to first page"
        tabIndex={isFirstPage ? -1 : 0}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      {/* Previous Page */}
      <button
        className="px-2 sm:px-3 py-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        disabled={isFirstPage}
        onClick={() => onPageChange(page - 1)}
        onKeyDown={(e) => handleKeyDown(e, page - 1)}
        aria-label="Go to previous page"
        tabIndex={isFirstPage ? -1 : 0}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      {showPageNumbers && (
        <>
          {/* Show ellipsis if there are pages before visible range - Hidden on mobile */}
          {visiblePages[0] > 1 && (
            <>
              <button
                className="hidden sm:block px-2 sm:px-3 py-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                onClick={() => onPageChange(1)}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                aria-label="Go to page 1"
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="hidden sm:block px-2 py-2 text-gray-400">...</span>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((pageNum) => (
            <button
              key={pageNum}
              className={`px-2 sm:px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-sm sm:text-base ${
                pageNum === page
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onPageChange(pageNum)}
              onKeyDown={(e) => handleKeyDown(e, pageNum)}
              aria-label={`Go to page ${pageNum}`}
              aria-current={pageNum === page ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}

          {/* Show ellipsis if there are pages after visible range - Hidden on mobile */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="hidden sm:block px-2 py-2 text-gray-400">...</span>
              )}
              <button
                className="hidden sm:block px-2 sm:px-3 py-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                onClick={() => onPageChange(totalPages)}
                onKeyDown={(e) => handleKeyDown(e, totalPages)}
                aria-label={`Go to page ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}
        </>
      )}

      {/* Next Page */}
      <button
        className="px-2 sm:px-3 py-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        disabled={isLastPage}
        onClick={() => onPageChange(page + 1)}
        onKeyDown={(e) => handleKeyDown(e, page + 1)}
        aria-label="Go to next page"
        tabIndex={isLastPage ? -1 : 0}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Last Page - Hidden on mobile */}
      <button
        className="hidden sm:block px-2 sm:px-3 py-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        disabled={isLastPage}
        onClick={() => onPageChange(totalPages)}
        onKeyDown={(e) => handleKeyDown(e, totalPages)}
        aria-label="Go to last page"
        tabIndex={isLastPage ? -1 : 0}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>

      {/* Page info */}
      <span className="text-xs sm:text-sm text-gray-500 ml-2 sm:ml-4">
        Page {page} of {totalPages}
      </span>
    </nav>
  );
} 