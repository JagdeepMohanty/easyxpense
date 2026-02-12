import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-darkcard border border-darkborder rounded-xl text-sm font-medium text-darktext hover:bg-darksecondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        ← Previous
      </button>

      <div className="hidden sm:flex items-center gap-2">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-darkmuted"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPage === page
                  ? 'bg-gradient-to-r from-accent-start to-accent-end text-white shadow-glow'
                  : 'bg-darkcard border border-darkborder text-darktext hover:bg-darksecondary'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>

      <div className="sm:hidden px-4 py-2 bg-darkcard border border-darkborder rounded-xl text-sm font-medium text-darktext">
        {currentPage} / {totalPages}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-darkcard border border-darkborder rounded-xl text-sm font-medium text-darktext hover:bg-darksecondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
