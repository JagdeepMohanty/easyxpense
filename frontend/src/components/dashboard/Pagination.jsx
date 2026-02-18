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
        className="px-4 py-2 bg-[#0F172A] border border-emerald-500/20 rounded-lg text-sm font-medium text-textPrimary hover:bg-emerald-500/5 hover:border-emerald-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        ← Previous
      </button>

      <div className="hidden sm:flex items-center gap-2">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-textSecondary"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === page
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-emerald-500/30'
                  : 'bg-[#0F172A] border border-emerald-500/20 text-textPrimary hover:bg-emerald-500/5 hover:border-emerald-400/40'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>

      <div className="sm:hidden px-4 py-2 bg-[#0F172A] border border-emerald-500/20 rounded-lg text-sm font-medium text-textPrimary">
        {currentPage} / {totalPages}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-[#0F172A] border border-emerald-500/20 rounded-lg text-sm font-medium text-textPrimary hover:bg-emerald-500/5 hover:border-emerald-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
