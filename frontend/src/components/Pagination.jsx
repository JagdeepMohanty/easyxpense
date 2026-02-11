import React from 'react';
import Button from './ui/Button';

const Pagination = ({ currentPage, totalPages, onPageChange, loading = false }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="pagination">
      <Button
        variant="secondary"
        onClick={handlePrev}
        disabled={currentPage === 1 || loading}
        size="sm"
      >
        ← Previous
      </Button>
      
      <span className="pagination-info">
        Page {currentPage} of {totalPages}
      </span>
      
      <Button
        variant="secondary"
        onClick={handleNext}
        disabled={currentPage === totalPages || loading}
        size="sm"
      >
        Next →
      </Button>
    </div>
  );
};

export default React.memo(Pagination);
